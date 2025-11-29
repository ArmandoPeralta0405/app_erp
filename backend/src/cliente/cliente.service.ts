import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { cliente as ClienteModel } from '@prisma/client';

type ClienteUniqueKey = { id_cliente: number };

@Injectable()
export class ClienteService {
    constructor(private prisma: PrismaService) { }

    create(createClienteDto: CreateClienteDto) {
        return this.prisma.cliente.create({
            data: createClienteDto,
            include: {
                ciudad: {
                    include: {
                        departamento: {
                            include: {
                                pais: true
                            }
                        }
                    }
                }
            },
        });
    }

    findAll() {
        return this.prisma.cliente.findMany({
            include: {
                ciudad: {
                    include: {
                        departamento: {
                            include: {
                                pais: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                nombre: 'asc',
            },
        });
    }

    async findOne(id: number): Promise<ClienteModel> {
        const key: ClienteUniqueKey = { id_cliente: id };

        const cliente = await this.prisma.cliente.findUnique({
            where: key,
            include: {
                ciudad: {
                    include: {
                        departamento: {
                            include: {
                                pais: true
                            }
                        }
                    }
                }
            },
        });

        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado.`);
        }
        return cliente;
    }

    update(id: number, updateClienteDto: UpdateClienteDto) {
        return this.prisma.cliente.update({
            where: { id_cliente: id },
            data: updateClienteDto,
            include: {
                ciudad: {
                    include: {
                        departamento: {
                            include: {
                                pais: true
                            }
                        }
                    }
                }
            },
        });
    }

    remove(id: number) {
        return this.prisma.cliente.update({
            where: { id_cliente: id },
            data: { estado: false },
        });
    }
}
