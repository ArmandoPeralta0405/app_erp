// src/auth/local.strategy.ts

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // Definimos qué campos usar para usuario y clave
    super({
      usernameField: 'alias', // Usamos 'alias' en lugar de 'username'
      passwordField: 'clave', // Usamos 'clave'
    });
  }

  // Método de validación que llama a AuthService
  async validate(alias: string, clave: string): Promise<any> {
    // Llama al servicio para validar si el alias y la clave son correctos
    const usuario = await this.authService.validateUser(alias, clave);

    if (!usuario) {
      // Lanza 401 Unauthorized si la validación falla
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Devolvemos el usuario, pero quitando la clave hasheada
    const { clave: claveOmitida, ...result } = usuario;
    return result;
  }
}
