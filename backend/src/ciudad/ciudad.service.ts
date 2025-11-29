import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ciudad as CiudadModel, Prisma } from '@prisma/client';
import { CreateCiudadDto } from './dto/create-ciudad.dto';
import { UpdateCiudadDto } from './dto/update-ciudad.dto';

type CiudadUniqueKey = Prisma.ciudadWhereUniqueInput;

@Injectable()
export class CiudadService {
    constructor(private prisma: PrismaService) { }

    create(createCiudadDto: CreateCiudadDto) {
        return this.prisma.ciudad.create({
            data: createCiudadDto,
            include: {
                departamento: true,
            },
        });
    }

    findAll() {
        return this.prisma.ciudad.findMany({
            include: {
                departamento: true,
            },
            orderBy: {
                nombre: 'asc',
            },
        });
    }

    async findOne(id: number): Promise<CiudadModel> {
        const key: CiudadUniqueKey = { id_ciudad: id };

        const ciudad = await this.prisma.ciudad.findUnique({
            where: key,
            include: {
                departamento: true,
            },
        });

        if (!ciudad) {
            throw new NotFoundException(`Ciudad con ID ${id} no encontrada.`);
        }
        return ciudad;
    }

    update(id: number, updateCiudadDto: UpdateCiudadDto) {
        return this.prisma.ciudad.update({
            where: { id_ciudad: id },
            data: updateCiudadDto,
            include: {
                departamento: true,
            },
        });
    }

    remove(id: number) {
        return this.prisma.ciudad.update({
            where: { id_ciudad: id },
            data: { estado: false },
        });
    }
}
