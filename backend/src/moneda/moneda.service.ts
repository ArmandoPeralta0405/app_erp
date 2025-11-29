// src/moneda/moneda.service.ts

import { Injectable, NotFoundException } from '@nestjs/common'; // 💡 Importar NotFoundException
import { PrismaService } from '../prisma/prisma.service';
import { moneda as MonedaModel, Prisma } from '@prisma/client'; // 💡 Importar Prisma
// 💡 Importar DTOs
import { CreateMonedaDto } from './dto/create_moneda.dto';
import { UpdateMonedaDto } from './dto/update_moneda.dto';

// ❌ Eliminamos los tipos manuales CreateMonedaData y UpdateMonedaData
type MonedaUniqueKey = Prisma.monedaWhereUniqueInput;

@Injectable()
export class MonedaService {
  constructor(private prisma: PrismaService) {} // 1. OBTENER TODAS LAS MONEDAS ACTIVAS

  async findAll(): Promise<MonedaModel[]> {
    return this.prisma.moneda.findMany({
      /*where: { estado: true },*/ // 💡 Filtramos por estado: true por defecto
      orderBy: {
        nombre: 'asc',
      },
    });
  } // 2. OBTENER UNA MONEDA POR ID

  async findOne(id: number): Promise<MonedaModel> {
    const key: MonedaUniqueKey = { id_moneda: id };
    const moneda = await this.prisma.moneda.findUnique({
      where: key,
    });

    if (!moneda) {
      throw new NotFoundException(`Moneda con ID ${id} no encontrada.`);
    }
    return moneda;
  } // 3. CREAR UNA NUEVA MONEDA (Recibe el DTO)

  async create(data: CreateMonedaDto): Promise<MonedaModel> {
    return this.prisma.moneda.create({
      data: data, // El DTO ya tiene los defaults y el tipado correcto
    });
  } // 4. ACTUALIZAR UNA MONEDA (PATCH /moneda/:id) (Recibe el DTO)

  async update(id: number, data: UpdateMonedaDto): Promise<MonedaModel> {
    const key: MonedaUniqueKey = { id_moneda: id };

    try {
      return await this.prisma.moneda.update({
        where: key,
        data: data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        // Código de error de Prisma para 'registro no encontrado'
        throw new NotFoundException(
          `Moneda con ID ${id} no encontrada para actualizar.`,
        );
      }
      throw error;
    }
  } // 5. ELIMINACIÓN LÓGICA (Cambiar estado a false)

  async remove(id: number): Promise<MonedaModel> {
    const key: MonedaUniqueKey = { id_moneda: id };

    try {
      return await this.prisma.moneda.update({
        where: key,
        data: {
          estado: false,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Moneda con ID ${id} no encontrada para desactivación.`,
        );
      }
      throw error;
    }
  }
}
