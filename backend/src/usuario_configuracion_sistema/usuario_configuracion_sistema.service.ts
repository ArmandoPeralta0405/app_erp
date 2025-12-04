import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioConfiguracionSistemaDto } from './dto/create-usuario_configuracion_sistema.dto';

@Injectable()
export class UsuarioConfiguracionSistemaService {
    constructor(private prisma: PrismaService) { }

    async create(createDto: CreateUsuarioConfiguracionSistemaDto) {
        return this.prisma.usuario_configuracion_sistema.create({
            data: createDto,
            include: {
                usuario: true,
                configuracion_sistema: true
            }
        });
    }

    async findAll() {
        return this.prisma.usuario_configuracion_sistema.findMany({
            include: {
                usuario: {
                    select: {
                        id_usuario: true,
                        nombre: true,
                        apellido: true,
                        alias: true
                    }
                },
                configuracion_sistema: {
                    select: {
                        id_configuracion_sistema: true,
                        descripcion: true,
                        estado: true
                    }
                }
            }
        });
    }

    async findByUsuario(id_usuario: number) {
        return this.prisma.usuario_configuracion_sistema.findMany({
            where: { id_usuario },
            include: {
                configuracion_sistema: {
                    select: {
                        id_configuracion_sistema: true,
                        descripcion: true,
                        estado: true
                    }
                }
            }
        });
    }

    async findByConfiguracion(id_configuracion_sistema: number) {
        return this.prisma.usuario_configuracion_sistema.findMany({
            where: { id_configuracion_sistema },
            include: {
                usuario: {
                    select: {
                        id_usuario: true,
                        nombre: true,
                        apellido: true,
                        alias: true
                    }
                }
            }
        });
    }

    async findOne(id_usuario: number, id_configuracion_sistema: number) {
        return this.prisma.usuario_configuracion_sistema.findUnique({
            where: {
                id_usuario_id_configuracion_sistema: {
                    id_usuario,
                    id_configuracion_sistema
                }
            },
            include: {
                usuario: true,
                configuracion_sistema: true
            }
        });
    }

    async remove(id_usuario: number, id_configuracion_sistema: number) {
        return this.prisma.usuario_configuracion_sistema.delete({
            where: {
                id_usuario_id_configuracion_sistema: {
                    id_usuario,
                    id_configuracion_sistema
                }
            }
        });
    }

    async removeAllByUsuario(id_usuario: number) {
        return this.prisma.usuario_configuracion_sistema.deleteMany({
            where: { id_usuario }
        });
    }

    async removeAllByConfiguracion(id_configuracion_sistema: number) {
        return this.prisma.usuario_configuracion_sistema.deleteMany({
            where: { id_configuracion_sistema }
        });
    }
}
