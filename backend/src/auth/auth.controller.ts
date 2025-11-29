// src/auth/auth.controller.ts

import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  // POST /auth/login
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // POST /auth/refresh
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(@Request() req) {
    return this.authService.refreshToken(req.user.userId);
  }
}
