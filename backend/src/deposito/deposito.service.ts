import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { deposito as DepositoModel, Prisma } from '@prisma/client';
import { CreateDepositoDto } from './dto/create_deposito.dto';
import { UpdateDepositoDto } from './dto/update_deposito.dto';

type DepositoUniqueKey = Prisma.depositoWhereUniqueInput;

@Injectable()
export class DepositoService {
  constructor(private prisma: PrismaService) { }

  // 1. OBTENER TODOS LOS DEPÓSITOS
  async findAll(): Promise<DepositoModel[]> {
    return this.prisma.deposito.findMany({
      include: {
        sucursal: {
          include: { empresa: true },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  // 1.1 OBTENER DEPÓSITOS POR SUCURSAL
  async findBySucursal(id_sucursal: number): Promise<DepositoModel[]> {
    return this.prisma.deposito.findMany({
      where: {
        id_sucursal: id_sucursal,
      },
      include: {
        sucursal: {
          include: { empresa: true },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  // 2. OBTENER UN DEPÓSITO POR ID
  async findOne(id: number): Promise<DepositoModel> {
    const key: DepositoUniqueKey = { id_deposito: id };

    const deposito = await this.prisma.deposito.findUnique({
      where: key,
      include: {
        sucursal: {
          include: { empresa: true },
        },
      },
    });

    if (!deposito) {
      throw new NotFoundException(`Depósito con ID ${id} no encontrado.`);
    }
    return deposito;
  }

  // 3. CREAR UN NUEVO DEPÓSITO
  async create(data: CreateDepositoDto): Promise<DepositoModel> {
    // Validar que la sucursal exista
    const sucursalExists = await this.prisma.sucursal.findUnique({
      where: { id_sucursal: data.id_sucursal },
    });

    if (!sucursalExists) {
      throw new BadRequestException(
        `La Sucursal con ID ${data.id_sucursal} no existe.`,
      );
    }

    return this.prisma.deposito.create({
      data,
      include: {
        sucursal: {
          include: { empresa: true },
        },
      },
    });
  }

  // 4. ACTUALIZAR DEPÓSITO
  async update(id: number, data: UpdateDepositoDto): Promise<DepositoModel> {
    await this.findOne(id); // Verificar que existe

    // Si se está cambiando la sucursal, validar que exista
    if (data.id_sucursal) {
      const sucursalExists = await this.prisma.sucursal.findUnique({
        where: { id_sucursal: data.id_sucursal },
      });

      if (!sucursalExists) {
        throw new BadRequestException(
          `La Sucursal con ID ${data.id_sucursal} no existe.`,
        );
      }
    }

    return this.prisma.deposito.update({
      where: { id_deposito: id },
      data,
      include: {
        sucursal: {
          include: { empresa: true },
        },
      },
    });
  }

  // 5. ELIMINACIÓN LÓGICA
  async remove(id: number): Promise<DepositoModel> {
    await this.findOne(id); // Verificar que existe

    return this.prisma.deposito.update({
      where: { id_deposito: id },
      data: { estado: false },
    });
  }
}
