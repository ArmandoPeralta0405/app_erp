import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';

@Injectable()
export class ArticuloService {
    constructor(private prisma: PrismaService) { }

    async create(createArticuloDto: CreateArticuloDto) {
        return this.prisma.articulo.create({
            data: {
                ...createArticuloDto,
            },
            include: {
                linea: true,
                tipo_articulo: true,
                marca: true,
                unidad_medida: true,
                impuesto: true,
            },
        });
    }

    async findAll() {
        const articulos = await this.prisma.articulo.findMany({
            include: {
                linea: true,
                tipo_articulo: true,
                marca: true,
                unidad_medida: true,
                impuesto: true,
            },
            orderBy: {
                id_articulo: 'desc',
            },
        });

        if (!articulos || articulos.length === 0) {
            throw new NotFoundException('No se encontraron artículos registrados');
        }

        return articulos;
    }

    async findOne(id: number) {
        const articulo = await this.prisma.articulo.findUnique({
            where: { id_articulo: id },
            include: {
                linea: true,
                tipo_articulo: true,
                marca: true,
                unidad_medida: true,
                impuesto: true,
                articulo_codigo_barra: {
                    include: {
                        unidad_medida: true,
                    },
                },
            },
        });

        if (!articulo) {
            throw new NotFoundException(`Artículo con ID ${id} no encontrado`);
        }

        return articulo;
    }

    async update(id: number, updateArticuloDto: UpdateArticuloDto) {
        await this.findOne(id); // Verifica que existe

        return this.prisma.articulo.update({
            where: { id_articulo: id },
            data: {
                ...updateArticuloDto,
                fecha_actualizacion: new Date(),
            },
            include: {
                linea: true,
                tipo_articulo: true,
                marca: true,
                unidad_medida: true,
                impuesto: true,
            },
        });
    }

    async remove(id: number) {
        await this.findOne(id); // Verifica que existe

        return this.prisma.articulo.update({
            where: { id_articulo: id },
            data: {
                estado: false,
                fecha_actualizacion: new Date(),
            },
        });
    }
}
