// src/auth/refresh-token.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.refreshSecret,
        });
    }

    async validate(payload: any) {
        if (!payload.sub) {
            throw new UnauthorizedException('Refresh token inválido');
        }

        return { userId: payload.sub };
    }
}
