import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { proveedor as ProveedorModel } from '@prisma/client';

type ProveedorUniqueKey = { id_proveedor: number };

@Injectable()
export class ProveedorService {
    constructor(private prisma: PrismaService) { }

    create(createProveedorDto: CreateProveedorDto) {
        return this.prisma.proveedor.create({
            data: createProveedorDto,
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
        return this.prisma.proveedor.findMany({
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
                razon_social: 'asc',
            },
        });
    }

    async findOne(id: number): Promise<ProveedorModel> {
        const key: ProveedorUniqueKey = { id_proveedor: id };

        const proveedor = await this.prisma.proveedor.findUnique({
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

        if (!proveedor) {
            throw new NotFoundException(`Proveedor con ID ${id} no encontrado.`);
        }
        return proveedor;
    }

    update(id: number, updateProveedorDto: UpdateProveedorDto) {
        return this.prisma.proveedor.update({
            where: { id_proveedor: id },
            data: updateProveedorDto,
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
        return this.prisma.proveedor.update({
            where: { id_proveedor: id },
            data: { estado: false },
        });
    }
}
