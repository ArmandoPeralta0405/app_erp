import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { tipo_articulo as Tipo_articuloModel, Prisma } from '@prisma/client';
import { CreateTipo_articuloDto } from './dto/create-tipo_articulo.dto';
import { UpdateTipo_articuloDto } from './dto/update-tipo_articulo.dto';

type Tipo_articuloUniqueKey = Prisma.tipo_articuloWhereUniqueInput;

@Injectable()
export class Tipo_articuloService {
    constructor(private prisma: PrismaService) { }

    create(createTipo_articuloDto: CreateTipo_articuloDto) {
        return this.prisma.tipo_articulo.create({
            data: createTipo_articuloDto,
        });
    }

    findAll() {
        return this.prisma.tipo_articulo.findMany({
            orderBy: {
                id_tipo_articulo: 'asc',
            },
        });
    }

    async findOne(id: number): Promise<Tipo_articuloModel> {
        const key: Tipo_articuloUniqueKey = { id_tipo_articulo: id };

        const tipo_articulo = await this.prisma.tipo_articulo.findUnique({
            where: key,
        });

        if (!tipo_articulo) {
            throw new NotFoundException(`Tipo_articulo con ID ${id} no encontrado.`);
        }
        return tipo_articulo;
    }

    update(id: number, updateTipo_articuloDto: UpdateTipo_articuloDto) {
        return this.prisma.tipo_articulo.update({
            where: { id_tipo_articulo: id },
            data: updateTipo_articuloDto,
        });
    }

    remove(id: number) {
        return this.prisma.tipo_articulo.delete({
            where: { id_tipo_articulo: id },
        });
    }
}
