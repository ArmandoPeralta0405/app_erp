// src/auth/auth.service.ts (Versión Corregida)

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from '../usuario/usuario.service';
import { usuario as UsuarioModel } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
  ) { } // 1. VALIDAR USUARIO (Usado por LocalStrategy)

  async validateUser(
    alias: string,
    clave: string,
  ): Promise<UsuarioModel | null> {
    // ... (lógica existente, no necesita cambios)
    const usuario = await this.usuarioService.findUserByAlias(alias);

    if (usuario && usuario.estado === false) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    if (usuario && (await bcrypt.compare(clave, usuario.clave))) {
      return usuario;
    }

    return null;
  } // 2. LOGIN (Genera el token JWT)

  async login(usuario: any) {
    // 💡 Paso 1: Obtener roles para incluir en el payload
    const rolesData = await this.usuarioService.getRolesForUser(
      usuario.id_usuario,
    );
    const rolesPayload = rolesData.map((r) => ({
      id: r.rol.id_rol,
      nombre: r.rol.nombre,
    }));

    // 💡 Paso 2: Definir el payload del token (información pública)
    const payload = {
      alias: usuario.alias,
      sub: usuario.id_usuario,
      roles: rolesPayload,
    };

    // 🔄 Generar access token (corta duración)
    const access_token = this.jwtService.sign(payload, { expiresIn: '2h' });

    // 🔄 Generar refresh token (larga duración)
    const refresh_token = this.jwtService.sign(
      { sub: usuario.id_usuario },
      { secret: 'APP_ERP_REFRESH_SECRET_KEY', expiresIn: '1d' }
    );

    return {
      access_token,
      refresh_token,
      usuario: {
        id: usuario.id_usuario,
        alias: usuario.alias,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        roles: rolesPayload,
      },
    };
  }

  // 🔄 Método para renovar el access token usando el refresh token
  async refreshToken(userId: number) {
    const usuario = await this.usuarioService.findOne(userId);

    if (!usuario || usuario.estado === false) {
      throw new UnauthorizedException('Usuario inválido o inactivo');
    }

    const rolesData = await this.usuarioService.getRolesForUser(userId);
    const rolesPayload = rolesData.map((r) => ({
      id: r.rol.id_rol,
      nombre: r.rol.nombre,
    }));

    const payload = {
      alias: usuario.alias,
      sub: usuario.id_usuario,
      roles: rolesPayload,
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '10h' }),
    };
  }
}
