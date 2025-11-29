// src/usuario_rol/usuario_rol.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  usuario_rol as UsuarioRolModel,
  rol as RolModel,
} from '@prisma/client';
import { CreateUsuarioRolDto } from './dto/create_usuario_rol.dto';

// Tipo que incluye los detalles del rol, usado en la consulta de roles
type UsuarioRolWithDetails = UsuarioRolModel & {
  rol: RolModel;
};

@Injectable()
export class UsuarioRolService {
  constructor(private prisma: PrismaService) {}

  // 1. ASIGNAR ROL (CREATE)
  // Utiliza el DTO para validar id_usuario e id_rol
  async create(data: CreateUsuarioRolDto): Promise<UsuarioRolModel> {
    try {
      return await this.prisma.usuario_rol.create({
        data: {
          id_usuario: data.id_usuario,
          id_rol: data.id_rol,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        // P2002: Violación de clave primaria (la asignación ya existe)
        throw new ConflictException('El rol ya está asignado a este usuario.');
      }
      if (error.code === 'P2003') {
        // P2003: Violación de clave foránea (usuario o rol no existen)
        throw new NotFoundException(
          'El usuario o el rol proporcionado no existe (Verifique IDs).',
        );
      }
      throw error;
    }
  }

  // 2. DESASIGNAR ROL (DELETE)
  // Requiere ambos IDs para identificar el registro único a eliminar
  async remove(id_usuario: number, id_rol: number): Promise<UsuarioRolModel> {
    try {
      return await this.prisma.usuario_rol.delete({
        where: {
          // Prisma requiere el objeto de clave compuesta para el método delete
          id_usuario_id_rol: {
            id_usuario: id_usuario,
            id_rol: id_rol,
          },
        },
      });
    } catch (error) {
      // P2025: Registro no encontrado
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `La asignación del Rol ${id_rol} al Usuario ${id_usuario} no fue encontrada.`,
        );
      }
      throw error;
    }
  }

  // 3. OBTENER ROLES POR USUARIO (LECTURA)
  // Devuelve la lista de roles asignados a un usuario específico
  async findRolesByUsuario(
    id_usuario: number,
  ): Promise<UsuarioRolWithDetails[]> {
    const rolesAsignados = await this.prisma.usuario_rol.findMany({
      where: { id_usuario: id_usuario },
      include: {
        rol: true, // Incluir los detalles del rol asociado desde la tabla 'rol'
      },
    });

    if (rolesAsignados.length === 0) {
      // Opcional: Lanzar error si el usuario no tiene roles (o devolver [] si prefieres)
      // throw new NotFoundException(`El usuario con ID ${id_usuario} no tiene roles asignados.`);
    }

    // Usamos un Type Assertion para retornar el tipo con los detalles del rol
    return rolesAsignados as UsuarioRolWithDetails[];
  }
}
