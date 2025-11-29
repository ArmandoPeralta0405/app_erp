// src/rol_programa/rol_programa.service.ts (Versión con DTOs y robustez)

import {
  Injectable,
  NotFoundException, // 💡 Importar
  ConflictException, // 💡 Importar
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { rol_programa as RolProgramaModel, Prisma } from '@prisma/client';
// 💡 Importar DTOs
import { CreateRolProgramaDto } from './dto/create_rol_programa.dto';
import { UpdateRolProgramaDto } from './dto/update_rol_programa.dto';

// Tipos para facilitar el trabajo (mantener el tipo de Prisma)
type RolProgramaUniqueKey = Prisma.rol_programaWhereUniqueInput;

// ❌ Eliminamos los tipos manuales CreateRolProgramaData y UpdateRolProgramaData

@Injectable()
export class RolProgramaService {
  constructor(private prisma: PrismaService) {}

  // 1. OBTENER TODOS LOS PERMISOS
  async findAll(): Promise<RolProgramaModel[]> {
    return this.prisma.rol_programa.findMany({
      include: {
        rol: true,
        programa: true,
      },
    });
  }

  // 2. OBTENER UN PERMISO POR CLAVE COMPUESTA
  async findOne(where: RolProgramaUniqueKey): Promise<RolProgramaModel> {
    const permiso = await this.prisma.rol_programa.findUnique({
      where,
      include: {
        rol: true,
        programa: true,
      },
    });

    // 💡 Añadir validación de existencia para uso posterior
    if (!permiso) {
      // Nota: El controller ya lanza un NotFoundException, pero esto asegura que la lógica del Service sea consistente
      throw new NotFoundException('Permiso de rol/programa no encontrado.');
    }

    return permiso;
  }

  // 3. CREAR UN NUEVO PERMISO (💡 Usamos CreateRolProgramaDto)
  async create(data: CreateRolProgramaDto): Promise<RolProgramaModel> {
    try {
      return await this.prisma.rol_programa.create({
        data: {
          id_rol: data.id_rol,
          id_programa: data.id_programa,
          // Aplicamos el valor por defecto 'false' si el campo no fue enviado
          acceso_lectura: data.acceso_lectura ?? false,
          acceso_escritura: data.acceso_escritura ?? false,
          acceso_eliminacion: data.acceso_eliminacion ?? false,
        },
      });
    } catch (error) {
      // P2002: Violación de restricción de unicidad (ya existe esta combinación de rol/programa)
      if (error.code === 'P2002') {
        throw new ConflictException(
          'El permiso para este rol y programa ya existe.',
        );
      }
      // P2003: Violación de clave foránea (rol o programa no existe)
      if (error.code === 'P2003') {
        throw new NotFoundException(
          'El Rol o el Programa proporcionado no existe.',
        );
      }
      throw error;
    }
  }

  // 4. ACTUALIZAR PERMISOS POR CLAVE COMPUESTA (💡 Usamos UpdateRolProgramaDto)
  async update(
    where: RolProgramaUniqueKey,
    data: UpdateRolProgramaDto,
  ): Promise<RolProgramaModel> {
    try {
      return await this.prisma.rol_programa.update({
        where,
        data: data,
      });
    } catch (error) {
      // P2025: No encontrado para actualizar
      if (error.code === 'P2025') {
        throw new NotFoundException(
          'Permiso de rol/programa no encontrado para actualizar.',
        );
      }
      throw error;
    }
  }

  // 5. ELIMINAR UN PERMISO POR CLAVE COMPUESTA
  async remove(where: RolProgramaUniqueKey): Promise<RolProgramaModel> {
    try {
      return await this.prisma.rol_programa.delete({
        where,
      });
    } catch (error) {
      // P2025: No encontrado para eliminar
      if (error.code === 'P2025') {
        throw new NotFoundException(
          'Permiso de rol/programa no encontrado para eliminar.',
        );
      }
      throw error;
    }
  }
}
