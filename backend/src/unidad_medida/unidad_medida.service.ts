import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { unidad_medida as UnidadMedidaModel, Prisma } from '@prisma/client';
import { CreateUnidadMedidaDto } from './dto/create-unidad_medida.dto';
import { UpdateUnidadMedidaDto } from './dto/update-unidad_medida.dto';

type UnidadMedidaUniqueKey = Prisma.unidad_medidaWhereUniqueInput;

@Injectable()
export class UnidadMedidaService {
    constructor(private prisma: PrismaService) { }

    create(createUnidadMedidaDto: CreateUnidadMedidaDto) {
        return this.prisma.unidad_medida.create({
            data: createUnidadMedidaDto,
        });
    }

    findAll() {
        return this.prisma.unidad_medida.findMany({
            orderBy: {
                id_unidad_medida: 'asc',
            },
        });
    }

    async findOne(id: number): Promise<UnidadMedidaModel> {
        const key: UnidadMedidaUniqueKey = { id_unidad_medida: id };

        const unidadMedida = await this.prisma.unidad_medida.findUnique({
            where: key,
        });

        if (!unidadMedida) {
            throw new NotFoundException(`Unidad de Medida con ID ${id} no encontrada.`);
        }
        return unidadMedida;
    }

    update(id: number, updateUnidadMedidaDto: UpdateUnidadMedidaDto) {
        return this.prisma.unidad_medida.update({
            where: { id_unidad_medida: id },
            data: updateUnidadMedidaDto,
        });
    }

    remove(id: number) {
        return this.prisma.unidad_medida.delete({
            where: { id_unidad_medida: id },
        });
    }
}
