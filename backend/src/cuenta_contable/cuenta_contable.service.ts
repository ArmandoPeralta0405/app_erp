import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { cuenta_contable as CuentaContableModel, Prisma } from '@prisma/client';
import { CreateCuentaContableDto } from './dto/create_cuenta_contable.dto';
import { UpdateCuentaContableDto } from './dto/update_cuenta_contable.dto';

type CuentaContableUniqueKey = Prisma.cuenta_contableWhereUniqueInput;

@Injectable()
export class CuentaContableService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<CuentaContableModel[]> {
        return this.prisma.cuenta_contable.findMany({
            include: {
                grupo_cuenta_contable: true,
            },
            orderBy: {
                numero_cuenta: 'asc',
            },
        });
    }

    async findOne(id: number): Promise<CuentaContableModel> {
        const key: CuentaContableUniqueKey = { id_cuenta_contable: id };

        const cuentaContable = await this.prisma.cuenta_contable.findUnique({
            where: key,
            include: {
                grupo_cuenta_contable: true,
            },
        });

        if (!cuentaContable) {
            throw new NotFoundException(`Cuenta Contable con ID ${id} no encontrada.`);
        }
        return cuentaContable;
    }

    async create(data: CreateCuentaContableDto): Promise<CuentaContableModel> {
        return this.prisma.cuenta_contable.create({
            data: data,
            include: {
                grupo_cuenta_contable: true,
            },
        });
    }

    async update(id: number, data: UpdateCuentaContableDto): Promise<CuentaContableModel> {
        const key: CuentaContableUniqueKey = { id_cuenta_contable: id };

        try {
            return await this.prisma.cuenta_contable.update({
                where: key,
                data: data,
                include: {
                    grupo_cuenta_contable: true,
                },
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException(
                    `Cuenta Contable con ID ${id} no encontrada para actualizar.`,
                );
            }
            throw error;
        }
    }

    async remove(id: number): Promise<CuentaContableModel> {
        const key: CuentaContableUniqueKey = { id_cuenta_contable: id };

        try {
            return await this.prisma.cuenta_contable.update({
                where: key,
                data: {
                    estado: false,
                },
                include: {
                    grupo_cuenta_contable: true,
                },
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException(
                    `Cuenta Contable con ID ${id} no encontrada para desactivación.`,
                );
            }
            throw error;
        }
    }
}
