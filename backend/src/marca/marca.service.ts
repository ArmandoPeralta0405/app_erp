import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { marca as MarcaModel, Prisma } from '@prisma/client';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';

type MarcaUniqueKey = Prisma.marcaWhereUniqueInput;

@Injectable()
export class MarcaService {
    constructor(private prisma: PrismaService) { }

    create(createMarcaDto: CreateMarcaDto) {
        return this.prisma.marca.create({
            data: createMarcaDto,
        });
    }

    findAll() {
        return this.prisma.marca.findMany({
            orderBy: {
                id_marca: 'asc',
            },
        });
    }

    async findOne(id: number): Promise<MarcaModel> {
        const key: MarcaUniqueKey = { id_marca: id };

        const marca = await this.prisma.marca.findUnique({
            where: key,
        });

        if (!marca) {
            throw new NotFoundException(`Marca con ID ${id} no encontrado.`);
        }
        return marca;
    }

    update(id: number, updateMarcaDto: UpdateMarcaDto) {
        return this.prisma.marca.update({
            where: { id_marca: id },
            data: updateMarcaDto,
        });
    }

    remove(id: number) {
        return this.prisma.marca.delete({
            where: { id_marca: id },
        });
    }
}
