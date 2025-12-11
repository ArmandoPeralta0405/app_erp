import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getInventoryStats() {
        // Obtener configuración del sistema para IDs de transacciones de ajuste
        const sysConfig = await this.prisma.configuracion_sistema.findFirst({
            where: { estado: true }
        });

        if (!sysConfig || (!sysConfig.id_tipo_transaccion_ajuste_positivo && !sysConfig.id_tipo_transaccion_ajuste_negativo)) {
            // Si no hay configuración, retornar datos vacíos
            return {
                kpis: {
                    totalInventory: 0,
                    adjustmentsThisMonth: 0,
                    movementsToday: 0,
                    criticalStock: 0,
                },
                chartData: [],
                recentAdjustments: [],
            };
        }

        // IDs de tipos de transacción para ajustes
        const adjustmentTypeIds = [
            sysConfig.id_tipo_transaccion_ajuste_positivo,
            sysConfig.id_tipo_transaccion_ajuste_negativo
        ].filter(id => id !== null);

        // Fecha actual para filtros
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const last7Days = new Date(now);
        last7Days.setDate(last7Days.getDate() - 7);

        // KPI 1: Total Inventario Valorizado
        // Sumar ajustes positivos
        const totalPositive = sysConfig.id_tipo_transaccion_ajuste_positivo
            ? await this.prisma.movimiento_stock.aggregate({
                _sum: {
                    total_ml: true,
                },
                where: {
                    id_tipo_transaccion: sysConfig.id_tipo_transaccion_ajuste_positivo,
                },
            })
            : { _sum: { total_ml: null } };

        // Sumar ajustes negativos (para restar)
        const totalNegative = sysConfig.id_tipo_transaccion_ajuste_negativo
            ? await this.prisma.movimiento_stock.aggregate({
                _sum: {
                    total_ml: true,
                },
                where: {
                    id_tipo_transaccion: sysConfig.id_tipo_transaccion_ajuste_negativo,
                },
            })
            : { _sum: { total_ml: null } };

        // Total = Positivos - Negativos
        const totalInventoryValue =
            Number(totalPositive._sum?.total_ml || 0) -
            Number(totalNegative._sum?.total_ml || 0);

        // KPI 2: Ajustes del Mes
        const adjustmentsThisMonth = await this.prisma.movimiento_stock.count({
            where: {
                id_tipo_transaccion: {
                    in: adjustmentTypeIds
                },
                fecha_documento: {
                    gte: startOfMonth,
                },
            },
        });

        // KPI 3: Movimientos Hoy
        const movementsToday = await this.prisma.movimiento_stock.count({
            where: {
                id_tipo_transaccion: {
                    in: adjustmentTypeIds
                },
                fecha_grabacion: {
                    gte: startOfToday,
                },
            },
        });

        // Gráfico: Ajustes por día (últimos 7 días)
        // Construir la consulta dinámicamente para manejar el array de IDs
        let adjustmentsByDay: { date: Date; count: bigint }[] = [];

        if (adjustmentTypeIds.length === 1) {
            // Si solo hay un ID, usar comparación simple
            adjustmentsByDay = await this.prisma.$queryRaw<
                { date: Date; count: bigint }[]
            >`
                SELECT 
                    DATE(fecha_documento) as date,
                    COUNT(*)::bigint as count
                FROM movimiento_stock
                WHERE id_tipo_transaccion = ${adjustmentTypeIds[0]}
                    AND fecha_documento >= ${last7Days}
                GROUP BY DATE(fecha_documento)
                ORDER BY date ASC
            `;
        } else {
            // Si hay múltiples IDs, usar OR
            adjustmentsByDay = await this.prisma.$queryRaw<
                { date: Date; count: bigint }[]
            >`
                SELECT 
                    DATE(fecha_documento) as date,
                    COUNT(*)::bigint as count
                FROM movimiento_stock
                WHERE (id_tipo_transaccion = ${adjustmentTypeIds[0]} OR id_tipo_transaccion = ${adjustmentTypeIds[1]})
                    AND fecha_documento >= ${last7Days}
                GROUP BY DATE(fecha_documento)
                ORDER BY date ASC
            `;
        }

        // Últimos 5 ajustes
        const recentAdjustments = await this.prisma.movimiento_stock.findMany({
            where: {
                id_tipo_transaccion: {
                    in: adjustmentTypeIds
                },
            },
            include: {
                sucursal: true,
            },
            orderBy: {
                fecha_grabacion: 'desc',
            },
            take: 5,
        });

        return {
            kpis: {
                totalInventory: totalInventoryValue,
                adjustmentsThisMonth,
                movementsToday,
                criticalStock: 0, // Placeholder
            },
            chartData: adjustmentsByDay.map((item) => ({
                date: item.date,
                count: Number(item.count),
            })),
            recentAdjustments: recentAdjustments.map((adj) => ({
                id_movimiento_stock: Number(adj.id_movimiento_stock),
                numero_comprobante: Number(adj.numero_comprobante),
                fecha_documento: adj.fecha_documento,
                sucursal: adj.sucursal?.nombre,
                total_ml: Number(adj.total_ml),
            })),
        };
    }
}
