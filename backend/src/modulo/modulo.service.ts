// src/modulo/modulo.service.ts (Versión con DTOs y robustez)

import {
  Injectable,
  NotFoundException, // 💡 Importar para manejo de errores
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { modulo as ModuloModel } from '@prisma/client';
// 💡 Importar DTOs
import { CreateModuloDto } from './dto/create_modulo.dto';
import { UpdateModuloDto } from './dto/update_modulo.dto';

// ❌ Tipos manuales eliminados, usamos los DTOs
// type CreateModuloData = Omit<ModuloModel, 'id_modulo'>;
// type UpdateModuloData = Partial<Omit<ModuloModel, 'id_modulo'>>;

@Injectable()
export class ModuloService {
  constructor(private prisma: PrismaService) {}

  // 1. OBTENER TODOS LOS MÓDULOS
  async findAll(): Promise<ModuloModel[]> {
    return this.prisma.modulo.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  // 2. OBTENER UN MÓDULO POR ID
  async findOne(id: number): Promise<ModuloModel> {
    const modulo = await this.prisma.modulo.findUnique({
      where: { id_modulo: id },
    });

    // 💡 Añadir validación de existencia
    if (!modulo) {
      throw new NotFoundException(`Módulo con ID ${id} no encontrado.`);
    }

    return modulo;
  }

  // 3. CREAR UN NUEVO MÓDULO (💡 Usamos CreateModuloDto)
  async create(data: CreateModuloDto): Promise<ModuloModel> {
    // 💡 Ya no es necesario manejar el 'estado' aquí si el DTO lo permite
    return this.prisma.modulo.create({
      data: data,
    });
  }

  // 4. ACTUALIZAR UN MÓDULO (PATCH /modulo/:id) (💡 Usamos UpdateModuloDto)
  async update(id: number, data: UpdateModuloDto): Promise<ModuloModel> {
    try {
      return await this.prisma.modulo.update({
        where: { id_modulo: id },
        data: data,
      });
    } catch (error) {
      // 💡 Manejo de error de Prisma (P2025: Not Found)
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Módulo con ID ${id} no encontrado para actualizar.`,
        );
      }
      throw error;
    }
  }

  // 5. ELIMINACIÓN LÓGICA (Cambiar estado a false)
  async remove(id: number): Promise<ModuloModel> {
    try {
      return await this.prisma.modulo.update({
        where: { id_modulo: id },
        data: {
          estado: false,
        },
      });
    } catch (error) {
      // 💡 Manejo de error de Prisma (P2025: Not Found)
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Módulo con ID ${id} no encontrado para desactivación.`,
        );
      }
      throw error;
    }
  }
}
