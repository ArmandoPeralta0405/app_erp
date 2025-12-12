import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ArticuloDepositoService {
    constructor(private prisma: PrismaService) { }

    async findExistencias(filters: any) {
        const {
            id_deposito,
            id_articulo,
            id_linea,
            solo_con_stock,
        } = filters;

        // Construir el where dinámicamente
        const where: any = {};

        // Filtro por depósito (puede ser array)
        if (id_deposito) {
            const depositos = Array.isArray(id_deposito)
                ? id_deposito.map(Number)
                : [Number(id_deposito)];
            where.id_deposito = { in: depositos };
        }

        // Filtro por artículo
        if (id_articulo) {
            where.id_articulo = Number(id_articulo);
        }

        // Filtro por línea (solo si no hay filtro de artículo específico)
        if (id_linea && !id_articulo) {
            where.articulo = {
                id_linea: Number(id_linea)
            };
        }

        // Filtro solo con stock
        if (solo_con_stock === 'true' || solo_con_stock === true) {
            where.existencia = { gt: 0 };
        }

        // Consultar existencias
        const existencias = await this.prisma.articulo_deposito.findMany({
            where,
            select: {
                id_articulo: true,
                id_deposito: true,
                existencia: true,
                articulo: {
                    select: {
                        codigo_alfanumerico: true,
                        nombre: true,
                        linea: {
                            select: {
                                nombre: true,
                            },
                        },
                        marca: {
                            select: {
                                nombre: true,
                            },
                        },
                        unidad_medida: {
                            select: {
                                nombre: true,
                            },
                        },
                    },
                },
                deposito: {
                    select: {
                        nombre: true,
                    },
                },
            },
            orderBy: [
                { deposito: { nombre: 'asc' } },
                { articulo: { nombre: 'asc' } },
            ],
        });

        // Mapear resultados
        return existencias.map((item) => ({
            id_articulo: item.id_articulo,
            id_deposito: item.id_deposito,
            codigo: item.articulo.codigo_alfanumerico || 'N/A',
            descripcion: item.articulo.nombre,
            linea: item.articulo.linea?.nombre || 'N/A',
            marca: item.articulo.marca?.nombre || 'N/A',
            unidad_medida: item.articulo.unidad_medida?.nombre || 'N/A',
            deposito: item.deposito.nombre,
            existencia: Number(item.existencia || 0),
        }));
    }
}
