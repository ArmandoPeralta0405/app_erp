import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { sucursal as SucursalModel, Prisma } from '@prisma/client';
import { CreateSucursalDto } from './dto/create_sucursal.dto';
import { UpdateSucursalDto } from './dto/update_sucursal.dto';

type SucursalUniqueKey = Prisma.sucursalWhereUniqueInput;

@Injectable()
export class SucursalService {
  constructor(private prisma: PrismaService) { }

  // 1. OBTENER TODAS LAS SUCURSALES
  async findAll(): Promise<SucursalModel[]> {
    return this.prisma.sucursal.findMany({
      include: {
        empresa: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  // 2. OBTENER UNA SUCURSAL POR ID
  async findOne(id: number): Promise<SucursalModel> {
    const key: SucursalUniqueKey = { id_sucursal: id };

    const sucursal = await this.prisma.sucursal.findUnique({
      where: key,
      include: {
        empresa: true,
      },
    });

    if (!sucursal) {
      throw new NotFoundException(`Sucursal con ID ${id} no encontrada.`);
    }
    return sucursal;
  }

  // 3. CREAR UNA NUEVA SUCURSAL
  async create(data: CreateSucursalDto): Promise<SucursalModel> {
    // Validar que solo haya una casa central por empresa
    if (data.casa_central === 'S') {
      await this.checkExistingCasaCentral(data.id_empresa);
    }

    return this.prisma.sucursal.create({
      data,
      include: {
        empresa: true,
      },
    });
  }

  // 4. ACTUALIZAR SUCURSAL
  async update(id: number, data: UpdateSucursalDto): Promise<SucursalModel> {
    // Obtener la sucursal actual para validaciones
    const sucursal = await this.findOne(id);

    // Validar casa central si se está cambiando
    if (data.casa_central === 'S') {
      await this.checkExistingCasaCentral(sucursal.id_empresa, id);
    }

    return this.prisma.sucursal.update({
      where: { id_sucursal: id },
      data,
      include: {
        empresa: true,
      },
    });
  }

  // 5. ELIMINACIÓN LÓGICA
  async remove(id: number): Promise<SucursalModel> {
    await this.findOne(id); // Verificar que existe

    return this.prisma.sucursal.update({
      where: { id_sucursal: id },
      data: { estado: false },
    });
  }

  // Función privada: Validar unicidad de Casa Central
  private async checkExistingCasaCentral(idEmpresa: number, excludeIdSucursal?: number) {
    const existingCasaCentral = await this.prisma.sucursal.findFirst({
      where: {
        id_empresa: idEmpresa,
        casa_central: 'S',
        ...(excludeIdSucursal && { id_sucursal: { not: excludeIdSucursal } }),
      },
    });

    if (existingCasaCentral) {
      throw new BadRequestException(
        `Ya existe una Casa Central (ID ${existingCasaCentral.id_sucursal}) para la Empresa ${idEmpresa}.`,
      );
    }
  }
}
