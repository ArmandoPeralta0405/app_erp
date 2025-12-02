import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClaseDocumentoDto } from './dto/create-clase_documento.dto';
import { UpdateClaseDocumentoDto } from './dto/update-clase_documento.dto';

@Injectable()
export class ClaseDocumentoService {
    constructor(private prisma: PrismaService) { }

    create(createDto: CreateClaseDocumentoDto) {
        return this.prisma.clase_documento.create({
            data: createDto,
        });
    }

    findAll() {
        return this.prisma.clase_documento.findMany({
            orderBy: {
                nombre: 'asc',
            },
        });
    }

    async findOne(id: number) {
        const claseDocumento = await this.prisma.clase_documento.findUnique({
            where: { id_clase_documento: id },
        });

        if (!claseDocumento) {
            throw new NotFoundException(`Clase de documento con ID ${id} no encontrada`);
        }

        return claseDocumento;
    }

    update(id: number, updateDto: UpdateClaseDocumentoDto) {
        return this.prisma.clase_documento.update({
            where: { id_clase_documento: id },
            data: updateDto,
        });
    }

    remove(id: number) {
        return this.prisma.clase_documento.delete({
            where: { id_clase_documento: id },
        });
    }
}
