// src/rol/rol.service.ts (VERSIÓN CORREGIDA)

import { Injectable, NotFoundException } from '@nestjs/common'; // 💡 Importar NotFoundException
import { PrismaService } from '../prisma/prisma.service';
import { rol as RolModel, Prisma } from '@prisma/client'; // 💡 Importar Prisma
// 💡 Importar DTOs
import { CreateRolDto } from './dto/create_rol.dto';
import { UpdateRolDto } from './dto/update_rol.dto';

// ❌ Eliminar los tipos manuales CreateRolData y UpdateRolData
type RolUniqueKey = Prisma.rolWhereUniqueInput;

@Injectable()
export class RolService {
  constructor(private prisma: PrismaService) {} // 1. OBTENER TODOS LOS ROLES ACTIVOS

  async findAll(): Promise<RolModel[]> {
    return this.prisma.rol.findMany({
      /*where: { estado: true },*/ // 💡 Aseguramos el filtro por roles activos
      orderBy: {
        nombre: 'asc',
      },
    });
  } // 2. OBTENER UN ROL POR ID (Con manejo de error)

  async findOne(id: number): Promise<RolModel> {
    const key: RolUniqueKey = { id_rol: id };

    const rol = await this.prisma.rol.findUnique({
      where: key,
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado.`);
    }
    return rol;
  } // 3. CREAR UN NUEVO ROL (Recibe el DTO)

  async create(data: CreateRolDto): Promise<RolModel> {
    return this.prisma.rol.create({
      data: data, // El DTO maneja el estado por defecto y validaciones
    });
  } // 4. ACTUALIZAR UN ROL (PATCH /rol/:id) (Con manejo de error)

  async update(id: number, data: UpdateRolDto): Promise<RolModel> {
    const key: RolUniqueKey = { id_rol: id };

    try {
      return await this.prisma.rol.update({
        where: key,
        data: data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        // Prisma: registro no encontrado
        throw new NotFoundException(
          `Rol con ID ${id} no encontrado para actualizar.`,
        );
      }
      throw error;
    }
  } // 5. ELIMINACIÓN LÓGICA (Con manejo de error)

  async remove(id: number): Promise<RolModel> {
    const key: RolUniqueKey = { id_rol: id };

    try {
      return await this.prisma.rol.update({
        where: key,
        data: {
          estado: false,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Rol con ID ${id} no encontrado para desactivación.`,
        );
      }
      throw error;
    }
  }
}
