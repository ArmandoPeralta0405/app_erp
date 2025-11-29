// src/categoria-programa/categoria_programa.service.ts (Versión con DTOs)

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { categoria_programa as CategoriaProgramaModel } from '@prisma/client';
// 💡 Importar DTOs
import { CreateCategoriaProgramaDto } from './dto/create_categoria_programa.dto';
import { UpdateCategoriaProgramaDto } from './dto/update_categoria_programa.dto';

// ❌ Eliminamos los tipos manuales CreateCategoriaProgramaData y UpdateCategoriaProgramaData

@Injectable()
export class CategoriaProgramaService {
  constructor(private prisma: PrismaService) {}

  // 1. OBTENER TODAS LAS CATEGORÍAS
  async findAll(): Promise<CategoriaProgramaModel[]> {
    return this.prisma.categoria_programa.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  // 2. OBTENER UNA CATEGORÍA POR ID
  async findOne(id: number): Promise<CategoriaProgramaModel> {
    const categoria = await this.prisma.categoria_programa.findUnique({
      where: { id_categoria_programa: id },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada.`);
    }

    return categoria;
  }

  // 3. CREAR UNA NUEVA CATEGORÍA (💡 Usamos CreateCategoriaProgramaDto)
  async create(
    data: CreateCategoriaProgramaDto,
  ): Promise<CategoriaProgramaModel> {
    return this.prisma.categoria_programa.create({
      data: data, // El DTO ya tiene la forma correcta y estado es opcional con default en Prisma
    });
  }

  // 4. ACTUALIZAR UNA CATEGORÍA (💡 Usamos UpdateCategoriaProgramaDto)
  async update(
    id: number,
    data: UpdateCategoriaProgramaDto,
  ): Promise<CategoriaProgramaModel> {
    try {
      return await this.prisma.categoria_programa.update({
        where: { id_categoria_programa: id },
        data: data,
      });
    } catch (error) {
      // Manejo de error de Prisma si no se encuentra el registro
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Categoría con ID ${id} no encontrada para actualizar.`,
        );
      }
      throw error;
    }
  }

  // 5. ELIMINACIÓN LÓGICA (Cambiar estado a false)
  async remove(id: number): Promise<CategoriaProgramaModel> {
    try {
      return await this.prisma.categoria_programa.update({
        where: { id_categoria_programa: id },
        data: {
          estado: false,
        },
      });
    } catch (error) {
      // Manejo de error de Prisma si no se encuentra el registro
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Categoría con ID ${id} no encontrada para desactivación.`,
        );
      }
      throw error;
    }
  }
}
