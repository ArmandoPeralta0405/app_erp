import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { linea as LineaModel, Prisma } from '@prisma/client';
import { CreateLineaDto } from './dto/create-linea.dto';
import { UpdateLineaDto } from './dto/update-linea.dto';

type LineaUniqueKey = Prisma.lineaWhereUniqueInput;

@Injectable()
export class LineaService {
    constructor(private prisma: PrismaService) { }

    create(createLineaDto: CreateLineaDto) {
        return this.prisma.linea.create({
            data: createLineaDto,
        });
    }

    findAll() {
        return this.prisma.linea.findMany({
            orderBy: {
                id_linea: 'asc',
            },
        });
    }

    async findOne(id: number): Promise<LineaModel> {
        const key: LineaUniqueKey = { id_linea: id };

        const linea = await this.prisma.linea.findUnique({
            where: key,
        });

        if (!linea) {
            throw new NotFoundException(`Linea con ID ${id} no encontrado.`);
        }
        return linea;
    }

    update(id: number, updateLineaDto: UpdateLineaDto) {
        return this.prisma.linea.update({
            where: { id_linea: id },
            data: updateLineaDto,
        });
    }

    remove(id: number) {
        return this.prisma.linea.delete({
            where: { id_linea: id },
        });
    }
}
