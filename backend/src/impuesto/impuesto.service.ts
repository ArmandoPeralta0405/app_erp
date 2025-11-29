import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { impuesto as ImpuestoModel, Prisma } from '@prisma/client';
import { CreateImpuestoDto } from './dto/create_impuesto.dto';
import { UpdateImpuestoDto } from './dto/update_impuesto.dto';

type ImpuestoUniqueKey = Prisma.impuestoWhereUniqueInput;

@Injectable()
export class ImpuestoService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<ImpuestoModel[]> {
        return this.prisma.impuesto.findMany({
            orderBy: {
                nombre: 'asc',
            },
        });
    }

    async findOne(id: number): Promise<ImpuestoModel> {
        const key: ImpuestoUniqueKey = { id_impuesto: id };

        const impuesto = await this.prisma.impuesto.findUnique({
            where: key,
        });

        if (!impuesto) {
            throw new NotFoundException(`Impuesto con ID ${id} no encontrado.`);
        }
        return impuesto;
    }

    async create(data: CreateImpuestoDto): Promise<ImpuestoModel> {
        return this.prisma.impuesto.create({
            data: data,
        });
    }

    async update(id: number, data: UpdateImpuestoDto): Promise<ImpuestoModel> {
        const key: ImpuestoUniqueKey = { id_impuesto: id };

        try {
            return await this.prisma.impuesto.update({
                where: key,
                data: data,
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException(
                    `Impuesto con ID ${id} no encontrado para actualizar.`,
                );
            }
            throw error;
        }
    }

    async remove(id: number): Promise<ImpuestoModel> {
        const key: ImpuestoUniqueKey = { id_impuesto: id };

        try {
            return await this.prisma.impuesto.update({
                where: key,
                data: {
                    estado: false,
                },
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException(
                    `Impuesto con ID ${id} no encontrado para desactivación.`,
                );
            }
            throw error;
        }
    }
}
