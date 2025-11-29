import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMotivoAjusteInventarioDto } from './dto/create-motivo-ajuste-inventario.dto';
import { UpdateMotivoAjusteInventarioDto } from './dto/update-motivo-ajuste-inventario.dto';

@Injectable()
export class MotivoAjusteInventarioService {
    constructor(private prisma: PrismaService) { }

    create(createDto: CreateMotivoAjusteInventarioDto) {
        return this.prisma.motivo_ajuste_inventario.create({
            data: createDto,
        });
    }

    findAll() {
        return this.prisma.motivo_ajuste_inventario.findMany({
            orderBy: {
                nombre: 'asc',
            },
        });
    }

    async findOne(id: number) {
        const motivo = await this.prisma.motivo_ajuste_inventario.findUnique({
            where: { id_motivo_ajuste_inventario: id },
        });

        if (!motivo) {
            throw new NotFoundException(`Motivo de ajuste con ID ${id} no encontrado`);
        }

        return motivo;
    }

    update(id: number, updateDto: UpdateMotivoAjusteInventarioDto) {
        return this.prisma.motivo_ajuste_inventario.update({
            where: { id_motivo_ajuste_inventario: id },
            data: updateDto,
        });
    }

    remove(id: number) {
        return this.prisma.motivo_ajuste_inventario.update({
            where: { id_motivo_ajuste_inventario: id },
            data: { estado: false },
        });
    }
}
