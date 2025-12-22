import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { concepto as ConceptoModel, Prisma } from '@prisma/client';
import { CreateConceptoDto } from './dto/create_concepto.dto';
import { UpdateConceptoDto } from './dto/update_concepto.dto';

type ConceptoUniqueKey = Prisma.conceptoWhereUniqueInput;

@Injectable()
export class ConceptoService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<ConceptoModel[]> {
        return this.prisma.concepto.findMany({
            include: {
                cuenta_contable: true,
            },
            orderBy: {
                descripcion: 'asc',
            },
        });
    }

    async findOne(id: number): Promise<ConceptoModel> {
        const key: ConceptoUniqueKey = { id_concepto: id };

        const concepto = await this.prisma.concepto.findUnique({
            where: key,
            include: {
                cuenta_contable: true,
            },
        });

        if (!concepto) {
            throw new NotFoundException(`Concepto con ID ${id} no encontrado.`);
        }
        return concepto;
    }

    async create(data: CreateConceptoDto): Promise<ConceptoModel> {
        return this.prisma.concepto.create({
            data: data,
            include: {
                cuenta_contable: true,
            },
        });
    }

    async update(id: number, data: UpdateConceptoDto): Promise<ConceptoModel> {
        const key: ConceptoUniqueKey = { id_concepto: id };

        try {
            return await this.prisma.concepto.update({
                where: key,
                data: data,
                include: {
                    cuenta_contable: true,
                },
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException(
                    `Concepto con ID ${id} no encontrado para actualizar.`,
                );
            }
            throw error;
        }
    }

    async remove(id: number): Promise<ConceptoModel> {
        const key: ConceptoUniqueKey = { id_concepto: id };

        try {
            return await this.prisma.concepto.update({
                where: key,
                data: {
                    estado: false,
                },
                include: {
                    cuenta_contable: true,
                },
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException(
                    `Concepto con ID ${id} no encontrado para desactivación.`,
                );
            }
            throw error;
        }
    }
}
