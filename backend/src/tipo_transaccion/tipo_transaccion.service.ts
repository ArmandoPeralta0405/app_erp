import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTipoTransaccionDto } from './dto/create-tipo_transaccion.dto';
import { UpdateTipoTransaccionDto } from './dto/update-tipo_transaccion.dto';

@Injectable()
export class TipoTransaccionService {
    constructor(private prisma: PrismaService) { }

    create(createDto: CreateTipoTransaccionDto) {
        return this.prisma.tipo_transaccion.create({
            data: createDto,
        });
    }

    findAll() {
        return this.prisma.tipo_transaccion.findMany({
            include: {
                clase_documento: true,
            },
            orderBy: {
                nombre: 'asc',
            },
        });
    }

    async findOne(id: number) {
        const tipoTransaccion = await this.prisma.tipo_transaccion.findUnique({
            where: { id_tipo_transaccion: id },
            include: {
                clase_documento: true,
            },
        });

        if (!tipoTransaccion) {
            throw new NotFoundException(`Tipo de transacción con ID ${id} no encontrado`);
        }

        return tipoTransaccion;
    }

    update(id: number, updateDto: UpdateTipoTransaccionDto) {
        return this.prisma.tipo_transaccion.update({
            where: { id_tipo_transaccion: id },
            data: updateDto,
        });
    }

    remove(id: number) {
        return this.prisma.tipo_transaccion.update({
            where: { id_tipo_transaccion: id },
            data: { estado: false },
        });
    }
}
