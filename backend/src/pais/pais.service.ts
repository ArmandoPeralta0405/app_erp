import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { pais as PaisModel, Prisma } from '@prisma/client';
import { CreatePaisDto } from './dto/create-pais.dto';
import { UpdatePaisDto } from './dto/update-pais.dto';

type PaisUniqueKey = Prisma.paisWhereUniqueInput;

@Injectable()
export class PaisService {
    constructor(private prisma: PrismaService) { }

    create(createPaisDto: CreatePaisDto) {
        return this.prisma.pais.create({
            data: createPaisDto,
        });
    }

    findAll() {
        return this.prisma.pais.findMany({
            orderBy: {
                nombre: 'asc',
            },
        });
    }

    async findOne(id: number): Promise<PaisModel> {
        const key: PaisUniqueKey = { id_pais: id };

        const pais = await this.prisma.pais.findUnique({
            where: key,
        });

        if (!pais) {
            throw new NotFoundException(`País con ID ${id} no encontrado.`);
        }
        return pais;
    }

    update(id: number, updatePaisDto: UpdatePaisDto) {
        return this.prisma.pais.update({
            where: { id_pais: id },
            data: updatePaisDto,
        });
    }

    remove(id: number) {
        return this.prisma.pais.delete({
            where: { id_pais: id },
        });
    }
}
