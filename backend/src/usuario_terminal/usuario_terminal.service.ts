import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateUsuarioTerminalDto,
    AssignUsuariosToTerminalDto,
    AssignTerminalesToUsuarioDto,
} from './dto/create-usuario_terminal.dto';

// Función para serializar BigInt a Number
function serializeBigInt(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return Number(obj);
    if (Array.isArray(obj)) return obj.map(serializeBigInt);
    if (typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
            result[key] = serializeBigInt(obj[key]);
        }
        return result;
    }
    return obj;
}

@Injectable()
export class UsuarioTerminalService {
    constructor(private prisma: PrismaService) { }

    async create(createDto: CreateUsuarioTerminalDto) {
        const result = await this.prisma.usuario_terminal.create({
            data: createDto,
            include: {
                usuario: {
                    select: {
                        id_usuario: true,
                        nombre: true,
                        apellido: true,
                        alias: true,
                    },
                },
                terminal: true,
            },
        });
        return serializeBigInt(result);
    }

    async findAll() {
        const result = await this.prisma.usuario_terminal.findMany({
            include: {
                usuario: {
                    select: {
                        id_usuario: true,
                        nombre: true,
                        apellido: true,
                        alias: true,
                    },
                },
                terminal: true,
            },
        });
        return serializeBigInt(result);
    }

    async findByUsuario(id_usuario: number) {
        const result = await this.prisma.usuario_terminal.findMany({
            where: { id_usuario },
            include: {
                terminal: true,
            },
        });
        return serializeBigInt(result);
    }

    async findByTerminal(id_terminal: number) {
        const result = await this.prisma.usuario_terminal.findMany({
            where: { id_terminal },
            include: {
                usuario: {
                    select: {
                        id_usuario: true,
                        nombre: true,
                        apellido: true,
                        alias: true,
                        estado: true,
                    },
                },
            },
        });
        return serializeBigInt(result);
    }

    async findOne(id_usuario: number, id_terminal: number) {
        const asignacion = await this.prisma.usuario_terminal.findUnique({
            where: {
                id_usuario_id_terminal: {
                    id_usuario,
                    id_terminal,
                },
            },
            include: {
                usuario: {
                    select: {
                        id_usuario: true,
                        nombre: true,
                        apellido: true,
                        alias: true,
                    },
                },
                terminal: true,
            },
        });

        if (!asignacion) {
            throw new NotFoundException(
                `Asignación de Usuario ${id_usuario} a Terminal ${id_terminal} no encontrada`,
            );
        }

        return serializeBigInt(asignacion);
    }

    async remove(id_usuario: number, id_terminal: number) {
        await this.findOne(id_usuario, id_terminal); // Verifica existencia

        return this.prisma.usuario_terminal.delete({
            where: {
                id_usuario_id_terminal: {
                    id_usuario,
                    id_terminal,
                },
            },
        });
    }

    // Asignar múltiples usuarios a una terminal
    async assignUsuariosToTerminal(assignDto: AssignUsuariosToTerminalDto) {
        const { id_terminal, id_usuarios } = assignDto;

        // Verificar que la terminal existe
        const terminal = await this.prisma.terminal.findUnique({
            where: { id_terminal },
        });

        if (!terminal) {
            throw new NotFoundException(`Terminal con ID ${id_terminal} no encontrada`);
        }

        // Eliminar asignaciones actuales
        await this.prisma.usuario_terminal.deleteMany({
            where: { id_terminal },
        });

        // Crear nuevas asignaciones
        const asignaciones = id_usuarios.map((id_usuario) => ({
            id_terminal,
            id_usuario,
        }));

        await this.prisma.usuario_terminal.createMany({
            data: asignaciones,
        });

        return this.findByTerminal(id_terminal);
    }

    // Asignar múltiples terminales a un usuario
    async assignTerminalesToUsuario(assignDto: AssignTerminalesToUsuarioDto) {
        const { id_usuario, id_terminales } = assignDto;

        // Verificar que el usuario existe
        const usuario = await this.prisma.usuario.findUnique({
            where: { id_usuario },
        });

        if (!usuario) {
            throw new NotFoundException(`Usuario con ID ${id_usuario} no encontrado`);
        }

        // Eliminar asignaciones actuales
        await this.prisma.usuario_terminal.deleteMany({
            where: { id_usuario },
        });

        // Crear nuevas asignaciones
        const asignaciones = id_terminales.map((id_terminal) => ({
            id_usuario,
            id_terminal,
        }));

        await this.prisma.usuario_terminal.createMany({
            data: asignaciones,
        });

        return this.findByUsuario(id_usuario);
    }
}
