// src/programa/programa.service.ts (Versión con DTOs y manejo de errores)

import {
  Injectable,
  NotFoundException, // 💡 Importar
  ConflictException, // 💡 Importar
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { programa as ProgramaModel } from '@prisma/client';
// 💡 Importar DTOs
import { CreateProgramaDto } from './dto/create_programa.dto';
import { UpdateProgramaDto } from './dto/update_programa.dto';

// ❌ Eliminamos los tipos manuales
// type CreateProgramaData = Omit<ProgramaModel, 'id_programa'>;
// type UpdateProgramaData = Partial<Omit<ProgramaModel, 'id_programa'>>;

@Injectable()
export class ProgramaService {
  constructor(private prisma: PrismaService) {}

  // 1. OBTENER TODOS LOS PROGRAMAS
  async findAll(): Promise<ProgramaModel[]> {
    return this.prisma.programa.findMany({
      include: {
        modulo: true,
        categoria_programa: true,
      },
      orderBy: {
        titulo: 'asc',
      },
    });
  }

  // 2. OBTENER UN PROGRAMA POR ID
  async findOne(id: number): Promise<ProgramaModel> {
    const programa = await this.prisma.programa.findUnique({
      where: { id_programa: id },
      include: {
        modulo: true,
        categoria_programa: true,
      },
    });

    if (!programa) {
      throw new NotFoundException(`Programa con ID ${id} no encontrado.`);
    }

    return programa;
  }

  // 3. CREAR UN NUEVO PROGRAMA (💡 Usamos CreateProgramaDto)
  async create(data: CreateProgramaDto): Promise<ProgramaModel> {
    try {
      return await this.prisma.programa.create({ data });
    } catch (error) {
      // Manejo de errores de Prisma
      // P2002: Violación de restricción de unicidad (codigo_alfanumerico)
      if (error.code === 'P2002') {
        throw new ConflictException(
          'El código alfanumérico proporcionado ya existe.',
        );
      }
      // P2003: Violación de clave foránea (id_modulo o id_categoria_programa inexistente)
      if (error.code === 'P2003') {
        throw new NotFoundException(
          'El módulo o la categoría del programa proporcionados no existen.',
        );
      }
      throw error;
    }
  }

  // 4. ACTUALIZAR UN PROGRAMA (PATCH /programa/:id) (💡 Usamos UpdateProgramaDto)
  async update(id: number, data: UpdateProgramaDto): Promise<ProgramaModel> {
    try {
      return await this.prisma.programa.update({
        where: { id_programa: id },
        data: data,
      });
    } catch (error) {
      // P2025: No encontrado para actualizar
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Programa con ID ${id} no encontrado para actualizar.`,
        );
      }
      // P2002: Violación de unicidad (si se intenta cambiar el código por uno existente)
      if (error.code === 'P2002') {
        throw new ConflictException(
          'El código alfanumérico proporcionado ya existe.',
        );
      }
      // P2003: Violación de clave foránea
      if (error.code === 'P2003') {
        throw new NotFoundException(
          'El módulo o la categoría del programa proporcionados no existen.',
        );
      }
      throw error;
    }
  }

  // 5. ELIMINACIÓN LÓGICA
  async remove(id: number): Promise<ProgramaModel> {
    try {
      return await this.prisma.programa.update({
        where: { id_programa: id },
        data: {
          estado: false,
        },
      });
    } catch (error) {
      // P2025: No encontrado para desactivar
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Programa con ID ${id} no encontrado para desactivación.`,
        );
      }
      throw error;
    }
  }
}
