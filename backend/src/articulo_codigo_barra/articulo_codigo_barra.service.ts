import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticuloCodigoBarraDto } from './dto/create-articulo_codigo_barra.dto';
import { UpdateArticuloCodigoBarraDto } from './dto/update-articulo_codigo_barra.dto';

@Injectable()
export class ArticuloCodigoBarraService {
    constructor(private prisma: PrismaService) { }

    async create(createDto: CreateArticuloCodigoBarraDto) {
        // Verificar que el artículo existe
        const articulo = await this.prisma.articulo.findUnique({
            where: { id_articulo: createDto.id_articulo },
        });

        if (!articulo) {
            throw new NotFoundException(`Artículo con ID ${createDto.id_articulo} no encontrado`);
        }

        // Si es principal, desmarcar otros códigos principales del mismo artículo
        if (createDto.es_principal) {
            await this.prisma.articulo_codigo_barra.updateMany({
                where: {
                    id_articulo: createDto.id_articulo,
                    es_principal: true,
                },
                data: {
                    es_principal: false,
                },
            });
        }

        return this.prisma.articulo_codigo_barra.create({
            data: createDto,
            include: {
                articulo: true,
                unidad_medida: true,
            },
        });
    }

    async findAll() {
        const codigos = await this.prisma.articulo_codigo_barra.findMany({
            include: {
                articulo: true,
                unidad_medida: true,
            },
            orderBy: {
                id_articulo: 'desc',
            },
        });

        if (!codigos || codigos.length === 0) {
            throw new NotFoundException('No se encontraron códigos de barra registrados');
        }

        return codigos;
    }

    async findByArticulo(idArticulo: number) {
        const codigos = await this.prisma.articulo_codigo_barra.findMany({
            where: { id_articulo: idArticulo },
            include: {
                unidad_medida: true,
            },
        });

        if (!codigos) {
            return [];
        }

        return codigos;
    }

    async findOne(idArticulo: number, codigoBarra: string) {
        const codigo = await this.prisma.articulo_codigo_barra.findUnique({
            where: {
                id_articulo_codigo_barra: {
                    id_articulo: idArticulo,
                    codigo_barra: codigoBarra,
                },
            },
            include: {
                articulo: true,
                unidad_medida: true,
            },
        });

        if (!codigo) {
            throw new NotFoundException(`Código de barra no encontrado`);
        }

        return codigo;
    }

    async update(idArticulo: number, codigoBarra: string, updateDto: UpdateArticuloCodigoBarraDto) {
        await this.findOne(idArticulo, codigoBarra); // Verifica que existe

        // Si se está marcando como principal, desmarcar otros
        if (updateDto.es_principal) {
            await this.prisma.articulo_codigo_barra.updateMany({
                where: {
                    id_articulo: idArticulo,
                    es_principal: true,
                },
                data: {
                    es_principal: false,
                },
            });
        }

        return this.prisma.articulo_codigo_barra.update({
            where: {
                id_articulo_codigo_barra: {
                    id_articulo: idArticulo,
                    codigo_barra: codigoBarra,
                },
            },
            data: updateDto,
            include: {
                articulo: true,
                unidad_medida: true,
            },
        });
    }

    async remove(idArticulo: number, codigoBarra: string) {
        await this.findOne(idArticulo, codigoBarra); // Verifica que existe

        return this.prisma.articulo_codigo_barra.delete({
            where: {
                id_articulo_codigo_barra: {
                    id_articulo: idArticulo,
                    codigo_barra: codigoBarra,
                },
            },
        });
    }
}
