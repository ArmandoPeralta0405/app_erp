// src/auth/jwt.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { UsuarioService } from '../usuario/usuario.service';
import { SafeUsuarioModel } from '../usuario/usuario.service'; // Asumiendo que exportaste SafeUsuarioModel

// Usamos el decorador Injectable para que esta clase pueda inyectar dependencias
@Injectable()
// PassportStrategy(Strategy, 'jwt') registra esta estrategia bajo el nombre 'jwt'
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usuarioService: UsuarioService) {
    super({
      // 1. Cómo extraer el token: desde el encabezado 'Authorization: Bearer <token>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. No ignorar la expiración (un token caducado debe ser rechazado)
      ignoreExpiration: false,
      // 3. Clave secreta: Debe coincidir con la usada para FIRMAR el token
      secretOrKey: jwtConstants.secret,
    });
  }

  // Este método se llama automáticamente si el token es válido y no está caducado.
  // El 'payload' es el objeto que firmamos en AuthService (alias, sub, roles).
  async validate(payload: any) {
    // 💡 VERIFICACIÓN ADICIONAL: Aseguramos que el usuario aún exista y esté activo en la DB.
    // Usamos payload.sub (que es id_usuario) para buscar.
    const user = await this.usuarioService.findOne(payload.sub);

    if (!user || user.estado === false) {
      // Si el usuario no existe o está inactivo, lanzamos una excepción
      throw new UnauthorizedException('Token inválido o usuario inactivo.');
    }

    // Lo que retornamos aquí se adjunta al objeto de solicitud (req.user)
    return {
      id: payload.sub,
      alias: payload.alias,
      nombre: user.nombre,
      apellido: user.apellido,
      roles: payload.roles, // Incluimos los roles en req.user
    };
  }
}
