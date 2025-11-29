import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { UpdateCotizacionDto } from './dto/update-cotizacion.dto';

@Injectable()
export class CotizacionService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.cotizacion.findMany({
            include: {
                moneda: true
            },
            orderBy: [
                { fecha: 'desc' },
                { id_moneda: 'asc' }
            ]
        });
    }

    async findOne(id_moneda: number, fecha: string) {
        const cotizacion = await this.prisma.cotizacion.findUnique({
            where: {
                id_moneda_fecha: {
                    id_moneda: id_moneda,
                    fecha: new Date(fecha)
                }
            },
            include: {
                moneda: true
            }
        });

        if (!cotizacion) {
            throw new NotFoundException(`Cotización con id_moneda ${id_moneda} y fecha ${fecha} no encontrada`);
        }

        return cotizacion;
    }

    async findByMoneda(id_moneda: number) {
        return this.prisma.cotizacion.findMany({
            where: {
                id_moneda: id_moneda
            },
            include: {
                moneda: true
            },
            orderBy: {
                fecha: 'desc'
            }
        });
    }

    async findByFecha(fecha: string) {
        return this.prisma.cotizacion.findMany({
            where: {
                fecha: new Date(fecha)
            },
            include: {
                moneda: true
            },
            orderBy: {
                id_moneda: 'asc'
            }
        });
    }

    async create(createCotizacionDto: CreateCotizacionDto) {
        try {
            return await this.prisma.cotizacion.create({
                data: {
                    id_moneda: createCotizacionDto.id_moneda,
                    fecha: new Date(createCotizacionDto.fecha),
                    tasa_compra: createCotizacionDto.tasa_compra,
                    tasa_venta: createCotizacionDto.tasa_venta
                },
                include: {
                    moneda: true
                }
            });
        } catch (error) {
            // Manejar error de clave duplicada de Prisma
            if (error.code === 'P2002') {
                throw new ConflictException('Ya existe una cotización para esta moneda en la fecha especificada');
            }
            throw error;
        }
    }

    async update(id_moneda: number, fecha: string, updateCotizacionDto: UpdateCotizacionDto) {
        // Verificar que existe
        await this.findOne(id_moneda, fecha);

        return this.prisma.cotizacion.update({
            where: {
                id_moneda_fecha: {
                    id_moneda: id_moneda,
                    fecha: new Date(fecha)
                }
            },
            data: {
                tasa_compra: updateCotizacionDto.tasa_compra,
                tasa_venta: updateCotizacionDto.tasa_venta
            },
            include: {
                moneda: true
            }
        });
    }

    async remove(id_moneda: number, fecha: string) {
        // Verificar que existe
        await this.findOne(id_moneda, fecha);

        return this.prisma.cotizacion.delete({
            where: {
                id_moneda_fecha: {
                    id_moneda: id_moneda,
                    fecha: new Date(fecha)
                }
            }
        });
    }
}
