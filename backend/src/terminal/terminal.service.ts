import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTerminalDto } from './dto/create-terminal.dto';
import { UpdateTerminalDto } from './dto/update-terminal.dto';

@Injectable()
export class TerminalService {
    constructor(private prisma: PrismaService) { }

    // Función para convertir BigInt a Number (JSON no soporta BigInt)
    private serializeBigInt(obj: any): any {
        if (obj === null || obj === undefined) return obj;
        if (typeof obj === 'bigint') return Number(obj);
        if (Array.isArray(obj)) return obj.map(item => this.serializeBigInt(item));
        if (typeof obj === 'object') {
            const result: any = {};
            for (const key of Object.keys(obj)) {
                result[key] = this.serializeBigInt(obj[key]);
            }
            return result;
        }
        return obj;
    }

    async create(createTerminalDto: CreateTerminalDto) {
        const terminal = await this.prisma.terminal.create({
            data: createTerminalDto,
        });
        return this.serializeBigInt(terminal);
    }

    async findAll() {
        const terminales = await this.prisma.terminal.findMany({
            include: {
                usuario_terminal: {
                    include: {
                        usuario: {
                            select: {
                                id_usuario: true,
                                nombre: true,
                                apellido: true,
                                alias: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                id_terminal: 'asc',
            },
        });
        return this.serializeBigInt(terminales);
    }

    async findOne(id: number) {
        const terminal = await this.prisma.terminal.findUnique({
            where: { id_terminal: id },
            include: {
                usuario_terminal: {
                    include: {
                        usuario: {
                            select: {
                                id_usuario: true,
                                nombre: true,
                                apellido: true,
                                alias: true,
                            },
                        },
                    },
                },
            },
        });

        if (!terminal) {
            throw new NotFoundException(`Terminal con ID ${id} no encontrado`);
        }

        return this.serializeBigInt(terminal);
    }

    async update(id: number, updateTerminalDto: UpdateTerminalDto) {
        await this.findOne(id); // Verifica existencia

        const terminal = await this.prisma.terminal.update({
            where: { id_terminal: id },
            data: updateTerminalDto,
        });
        return this.serializeBigInt(terminal);
    }

    async remove(id: number) {
        await this.findOne(id); // Verifica existencia

        // Eliminación lógica: solo cambia el estado a false
        const terminal = await this.prisma.terminal.update({
            where: { id_terminal: id },
            data: { estado: false },
        });
        return this.serializeBigInt(terminal);
    }
}
