import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { grupo_cuenta_contable as GrupoCuentaContableModel, Prisma } from '@prisma/client';
import { CreateGrupoCuentaContableDto } from './dto/create_grupo_cuenta_contable.dto';
import { UpdateGrupoCuentaContableDto } from './dto/update_grupo_cuenta_contable.dto';

type GrupoCuentaContableUniqueKey = Prisma.grupo_cuenta_contableWhereUniqueInput;

@Injectable()
export class GrupoCuentaContableService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<GrupoCuentaContableModel[]> {
        return this.prisma.grupo_cuenta_contable.findMany({
            orderBy: {
                nombre: 'asc',
            },
        });
    }

    async findOne(id: number): Promise<GrupoCuentaContableModel> {
        const key: GrupoCuentaContableUniqueKey = { id_grupo_cuenta_contable: id };

        const grupoCuentaContable = await this.prisma.grupo_cuenta_contable.findUnique({
            where: key,
        });

        if (!grupoCuentaContable) {
            throw new NotFoundException(`Grupo de Cuenta Contable con ID ${id} no encontrado.`);
        }
        return grupoCuentaContable;
    }

    async create(data: CreateGrupoCuentaContableDto): Promise<GrupoCuentaContableModel> {
        return this.prisma.grupo_cuenta_contable.create({
            data: data,
        });
    }

    async update(id: number, data: UpdateGrupoCuentaContableDto): Promise<GrupoCuentaContableModel> {
        const key: GrupoCuentaContableUniqueKey = { id_grupo_cuenta_contable: id };

        try {
            return await this.prisma.grupo_cuenta_contable.update({
                where: key,
                data: data,
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException(
                    `Grupo de Cuenta Contable con ID ${id} no encontrado para actualizar.`,
                );
            }
            throw error;
        }
    }

    async remove(id: number): Promise<GrupoCuentaContableModel> {
        const key: GrupoCuentaContableUniqueKey = { id_grupo_cuenta_contable: id };

        try {
            return await this.prisma.grupo_cuenta_contable.update({
                where: key,
                data: {
                    estado: false,
                },
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException(
                    `Grupo de Cuenta Contable con ID ${id} no encontrado para desactivación.`,
                );
            }
            throw error;
        }
    }
}
