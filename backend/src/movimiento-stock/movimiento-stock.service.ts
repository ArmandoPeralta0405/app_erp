import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovimientoStockDto, UpdateMovimientoStockDto } from './dto/movimiento-stock.dto';

// Función para serializar BigInt a Number
// Función para serializar BigInt a Number y manejar fechas/ciclos
function serializeBigInt(obj: any, seen = new WeakSet()): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return Number(obj);
    if (obj instanceof Date) return obj.toISOString();

    if (typeof obj === 'object') {
        if (seen.has(obj)) return null; // Evitar ciclos
        seen.add(obj);

        if (Array.isArray(obj)) return obj.map(v => serializeBigInt(v, seen));

        const result: any = {};
        for (const key in obj) {
            result[key] = serializeBigInt(obj[key], seen);
        }
        return result;
    }
    return obj;
}

@Injectable()
export class MovimientoStockService {
    constructor(private prisma: PrismaService) { }

    // Crear movimiento con cabecera y detalle
    async create(createDto: CreateMovimientoStockDto) {
        const { detalle, ...cabecera } = createDto;

        const result = await this.prisma.$transaction(async (tx) => {
            // 1. Crear cabecera
            const movimiento = await tx.movimiento_stock.create({
                data: {
                    id_tipo_transaccion: cabecera.id_tipo_transaccion,
                    id_sucursal: cabecera.id_sucursal,
                    id_deposito: cabecera.id_deposito,
                    id_usuario: cabecera.id_usuario,
                    id_moneda: cabecera.id_moneda,
                    id_cliente: cabecera.id_cliente,
                    id_proveedor: cabecera.id_proveedor,
                    id_motivo_ajuste: cabecera.id_motivo_ajuste,
                    id_movimiento_stock_padre: cabecera.id_movimiento_stock_padre,
                    numero_comprobante: cabecera.numero_comprobante,
                    numero_timbrado: cabecera.numero_timbrado,
                    fecha_documento: new Date(cabecera.fecha_documento),
                    tasa_cambio: cabecera.tasa_cambio,
                    total_ml: cabecera.total_ml,
                    total_me: cabecera.total_me,
                    observacion: cabecera.observacion,
                },
            });

            // 2. Crear detalles
            if (detalle && detalle.length > 0) {
                await tx.movimiento_stock_detalle.createMany({
                    data: detalle.map((item) => ({
                        id_movimiento_stock: movimiento.id_movimiento_stock,
                        id_articulo: item.id_articulo,
                        numero_item: item.numero_item,
                        cantidad: item.cantidad,
                        costo_ml: item.costo_ml ?? 0,
                        costo_me: item.costo_me,
                        precio_ml: item.precio_ml ?? 0,
                        precio_me: item.precio_me,
                        porcentaje_iva: item.porcentaje_iva ?? 0,
                        porcentaje_descuento: item.porcentaje_descuento ?? 0,
                        descuento_ml: item.descuento_ml ?? 0,
                        descuento_me: item.descuento_me,
                        importe_ml: item.importe_ml ?? 0,
                        importe_me: item.importe_me,
                    })),
                });
            }

            // 3. Retornar el movimiento con su detalle
            return tx.movimiento_stock.findUnique({
                where: { id_movimiento_stock: movimiento.id_movimiento_stock },
                include: {
                    movimiento_stock_detalle: {
                        include: {
                            articulo: {
                                select: {
                                    id_articulo: true,
                                    codigo_alfanumerico: true,
                                    nombre: true,
                                },
                            },
                        },
                    },
                    tipo_transaccion: true,
                    sucursal: true,
                    deposito: true,
                    usuario: {
                        select: {
                            id_usuario: true,
                            nombre: true,
                            apellido: true,
                            alias: true,
                        },
                    },
                    moneda: true,
                    cliente: true,
                    proveedor: true,
                    motivo_ajuste_inventario: true,
                },
            });
        });

        return serializeBigInt(result);
    }

    // Listar todos los movimientos con filtros opcionales
    async findAll(filters?: {
        id_tipo_transaccion?: number;
        id_sucursal?: number;
        id_deposito?: number;
        id_moneda?: number;
        fecha_desde?: string;
        fecha_hasta?: string;
        id_cliente?: number;
        id_proveedor?: number;
        includeDetails?: boolean;
    }) {
        const where: any = {};

        if (filters?.id_tipo_transaccion) {
            where.id_tipo_transaccion = Number(filters.id_tipo_transaccion);
        }
        if (filters?.id_sucursal) {
            where.id_sucursal = Number(filters.id_sucursal);
        }
        if (filters?.id_deposito) {
            where.id_deposito = Number(filters.id_deposito);
        }
        if (filters?.id_moneda) {
            where.id_moneda = Number(filters.id_moneda);
        }
        if (filters?.id_cliente) {
            where.id_cliente = Number(filters.id_cliente);
        }
        if (filters?.id_proveedor) {
            where.id_proveedor = Number(filters.id_proveedor);
        }
        if (filters?.fecha_desde || filters?.fecha_hasta) {
            where.fecha_documento = {};
            if (filters?.fecha_desde) {
                where.fecha_documento.gte = new Date(filters.fecha_desde);
            }
            if (filters?.fecha_hasta) {
                // Ajustar hasta el final del día si es necesario, o tal cual viene
                // Asumimos que viene YYYY-MM-DD
                const hasta = new Date(filters.fecha_hasta);
                hasta.setHours(23, 59, 59, 999);
                where.fecha_documento.lte = hasta;
            }
        }

        const includeObj: any = {
            tipo_transaccion: true,
            sucursal: true,
            deposito: true,
            usuario: {
                select: {
                    id_usuario: true,
                    nombre: true,
                    apellido: true,
                    alias: true,
                },
            },
            moneda: true,
            cliente: true,
            proveedor: true,
            motivo_ajuste_inventario: true,
        };

        if (filters?.includeDetails) {
            includeObj.movimiento_stock_detalle = {
                include: {
                    articulo: {
                        select: {
                            id_articulo: true,
                            codigo_alfanumerico: true,
                            nombre: true,
                        },
                    },
                },
            };
        }

        const result = await this.prisma.movimiento_stock.findMany({
            where,
            include: includeObj,
            orderBy: {
                fecha_grabacion: 'desc',
            },
        });

        return serializeBigInt(result);
    }

    // Obtener un movimiento por ID con su detalle
    async findOne(id: number) {
        const result = await this.prisma.movimiento_stock.findUnique({
            where: { id_movimiento_stock: id },
            include: {
                movimiento_stock_detalle: {
                    include: {
                        articulo: {
                            select: {
                                id_articulo: true,
                                codigo_alfanumerico: true,
                                nombre: true,
                            },
                        },
                    },
                    orderBy: {
                        numero_item: 'asc',
                    },
                },
                tipo_transaccion: true,
                sucursal: true,
                deposito: true,
                usuario: {
                    select: {
                        id_usuario: true,
                        nombre: true,
                        apellido: true,
                        alias: true,
                    },
                },
                moneda: true,
                cliente: true,
                proveedor: true,
                motivo_ajuste_inventario: true,
            },
        });

        if (!result) {
            throw new NotFoundException(`Movimiento de stock con ID ${id} no encontrado`);
        }

        return serializeBigInt(result);
    }

    // Actualizar cabecera del movimiento (sin detalle)
    async update(id: number, updateDto: UpdateMovimientoStockDto) {
        await this.findOne(id); // Verificar que existe

        const result = await this.prisma.movimiento_stock.update({
            where: { id_movimiento_stock: id },
            data: {
                ...updateDto,
                fecha_documento: updateDto.fecha_documento
                    ? new Date(updateDto.fecha_documento)
                    : undefined,
            },
            include: {
                movimiento_stock_detalle: true,
                tipo_transaccion: true,
                sucursal: true,
                deposito: true,
                moneda: true,
            },
        });

        return serializeBigInt(result);
    }

    // Eliminar movimiento (cascade elimina el detalle)
    async remove(id: number) {
        const movimiento = await this.findOne(id);

        // TODO: Antes de eliminar, guardar en tabla de auditoría

        await this.prisma.movimiento_stock.delete({
            where: { id_movimiento_stock: id },
        });

        return { message: `Movimiento ${id} eliminado correctamente`, movimiento };
    }

    // Obtener solo el detalle de un movimiento
    async findDetalle(id: number) {
        const result = await this.prisma.movimiento_stock_detalle.findMany({
            where: { id_movimiento_stock: id },
            include: {
                articulo: {
                    select: {
                        id_articulo: true,
                        codigo_alfanumerico: true,
                        nombre: true,
                    },
                },
            },
            orderBy: {
                numero_item: 'asc',
            },
        });

        return serializeBigInt(result);
    }
}
