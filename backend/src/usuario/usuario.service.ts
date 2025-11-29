// src/usuario/usuario.service.ts (Versión Final con métodos de Auth)

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { usuario as UsuarioModel } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// 💡 Nuevo tipo: Excluye 'clave' para las respuestas que van al frontend
//type SafeUsuarioModel = Omit<UsuarioModel, 'clave'>;
export type SafeUsuarioModel = Omit<UsuarioModel, 'clave'>; // 💡 ¡Añadir 'export'!

// 💡 Importar DTOs
import { CreateUsuarioDto } from './dto/create_usuario.dto';
import { UpdateUsuarioDto } from './dto/update_usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(private prisma: PrismaService) { }

  // Definimos los campos seguros a devolver en una propiedad para evitar repetición
  private readonly selectFieldsSafe = {
    id_usuario: true,
    nombre: true,
    apellido: true,
    cedula: true,
    telefono: true,
    direccion: true,
    estado: true,
    alias: true,
    fecha_creacion: true,
    fecha_actualizacion: true,
  };

  // ==========================================================
  // 🔑 MÉTODOS REQUERIDOS POR EL AUTH SERVICE
  // ==========================================================

  // A. Buscar Usuario por Alias (Necesita la clave para comparar)
  async findUserByAlias(alias: string): Promise<UsuarioModel | null> {
    // Retorna el objeto completo, incluyendo la clave hasheada, para que AuthService pueda compararla.
    return this.prisma.usuario.findUnique({
      where: { alias: alias },
    });
  }

  // B. Obtener Roles del Usuario (Necesario para el payload del JWT)
  async getRolesForUser(
    id_usuario: number, // 🚀 CAMBIO APLICADO: Ahora el tipo de retorno incluye id_rol
  ): Promise<Array<{ rol: { id_rol: number; nombre: string } }>> {
    // Consulta la tabla pivote usuario_rol e incluye los nombres de los roles.
    return this.prisma.usuario_rol.findMany({
      where: { id_usuario: id_usuario },
      select: {
        rol: {
          select: {
            id_rol: true,
            nombre: true,
          },
        },
      },
    });
  }

  // ==========================================================
  // CRUD EXISTENTE
  // ==========================================================

  // 1. OBTENER TODOS LOS USUARIOS
  async findAll(): Promise<SafeUsuarioModel[]> {
    const usuarios = await this.prisma.usuario.findMany({
      select: this.selectFieldsSafe,
      orderBy: { nombre: 'asc' },
    });
    return usuarios as SafeUsuarioModel[];
  }

  // 2. OBTENER UNO POR ID
  async findOne(id: number): Promise<SafeUsuarioModel> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: this.selectFieldsSafe,
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }
    return usuario;
  }

  // 3. CREAR UN NUEVO USUARIO
  async create(data: CreateUsuarioDto): Promise<SafeUsuarioModel> {
    try {
      const hashedPassword = await bcrypt.hash(data.clave, 10);

      return await this.prisma.usuario.create({
        data: {
          ...data,
          clave: hashedPassword,
        },
        select: this.selectFieldsSafe,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'El alias (nombre de usuario) proporcionado ya existe.',
        );
      }
      throw error;
    }
  }

  // 4. ACTUALIZAR UN USUARIO
  async update(id: number, data: UpdateUsuarioDto): Promise<SafeUsuarioModel> {
    try {
      const updateData: any = { ...data };

      if (data.clave) {
        updateData.clave = await bcrypt.hash(data.clave, 10);
      }

      return await this.prisma.usuario.update({
        where: { id_usuario: id },
        data: updateData,
        select: this.selectFieldsSafe,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Usuario con ID ${id} no encontrado para actualizar.`,
        );
      }
      if (error.code === 'P2002') {
        throw new ConflictException(
          'El alias (nombre de usuario) proporcionado ya existe.',
        );
      }
      throw error;
    }
  }

  // 5. ELIMINACIÓN LÓGICA
  async remove(id: number): Promise<SafeUsuarioModel> {
    try {
      return await this.prisma.usuario.update({
        where: { id_usuario: id },
        data: { estado: false },
        select: this.selectFieldsSafe,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Usuario con ID ${id} no encontrado para desactivación.`,
        );
      }
      throw error;
    }
  }

  // ==========================================================
  // MÉTODO PARA OBTENER PROGRAMAS DEL USUARIO
  // ==========================================================

  async getProgramasForUser(id_usuario: number) {
    // 1. Obtener los roles del usuario
    const rolesUsuario = await this.prisma.usuario_rol.findMany({
      where: { id_usuario },
      select: { id_rol: true },
    });

    if (rolesUsuario.length === 0) {
      return []; // Usuario sin roles, sin programas
    }

    const rolesIds = rolesUsuario.map((ur) => ur.id_rol);

    // 2. Obtener programas con acceso de lectura para esos roles (INCLUYENDO PERMISOS)
    const programasConAcceso = await this.prisma.rol_programa.findMany({
      where: {
        id_rol: { in: rolesIds },
        acceso_lectura: true,
        programa: { estado: true }, // Solo programas activos
      },
      select: {
        id_programa: true,
        acceso_lectura: true,
        acceso_escritura: true,
        acceso_eliminacion: true,
        programa: {
          select: {
            id_programa: true,
            titulo: true,
            ruta_acceso: true,
            codigo_alfanumerico: true,
            id_modulo: true,
            id_categoria_programa: true,
            modulo: {
              select: {
                id_modulo: true,
                nombre: true,
              },
            },
            categoria_programa: {
              select: {
                id_categoria_programa: true,
                nombre: true,
              },
            },
          },
        },
      },
    });

    // 3. Consolidar permisos por programa (OR lógico si múltiples roles)
    const permisosMap = new Map<number, { lectura: boolean; escritura: boolean; eliminacion: boolean }>();

    programasConAcceso.forEach((rp) => {
      const idPrograma = rp.id_programa;

      if (!permisosMap.has(idPrograma)) {
        permisosMap.set(idPrograma, {
          lectura: rp.acceso_lectura,
          escritura: rp.acceso_escritura,
          eliminacion: rp.acceso_eliminacion,
        });
      } else {
        // OR lógico: si cualquier rol tiene el permiso, el usuario lo tiene
        const permisos = permisosMap.get(idPrograma);
        if (permisos) {
          permisos.lectura = permisos.lectura || rp.acceso_lectura;
          permisos.escritura = permisos.escritura || rp.acceso_escritura;
          permisos.eliminacion = permisos.eliminacion || rp.acceso_eliminacion;
        }
      }
    });

    // 4. Organizar por módulo → categoría → programas (con permisos)
    const modulosMap = new Map();

    programasConAcceso.forEach(({ programa }) => {
      const { modulo, categoria_programa, ...programaData } = programa;

      // Crear o obtener módulo
      if (!modulosMap.has(modulo.id_modulo)) {
        modulosMap.set(modulo.id_modulo, {
          id_modulo: modulo.id_modulo,
          nombre_modulo: modulo.nombre,
          categorias: new Map(),
        });
      }

      const moduloData = modulosMap.get(modulo.id_modulo);

      // Crear o obtener categoría dentro del módulo
      if (!moduloData.categorias.has(categoria_programa.id_categoria_programa)) {
        moduloData.categorias.set(categoria_programa.id_categoria_programa, {
          id_categoria: categoria_programa.id_categoria_programa,
          nombre_categoria: categoria_programa.nombre,
          programas: new Map(), // Usar Map para evitar duplicados
        });
      }

      const categoriaData = moduloData.categorias.get(
        categoria_programa.id_categoria_programa,
      );

      // Agregar programa a la categoría solo si no existe ya
      if (!categoriaData.programas.has(programaData.id_programa)) {
        const permisos = permisosMap.get(programaData.id_programa);
        categoriaData.programas.set(programaData.id_programa, {
          ...programaData,
          permisos, // Agregar permisos consolidados
        });
      }
    });

    // 5. Convertir Maps a Arrays
    const resultado = Array.from(modulosMap.values()).map((modulo: any) => ({
      ...modulo,
      categorias: Array.from(modulo.categorias.values()).map((categoria: any) => ({
        ...categoria,
        programas: Array.from(categoria.programas.values()),
      })),
    }));

    return resultado;
  }
}
