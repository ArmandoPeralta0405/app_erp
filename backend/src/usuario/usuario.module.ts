// src/usuario/usuario.module.ts (Código Corregido)

import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  // 💡 Exportar UsuarioService para que AuthModule lo pueda inyectar
  exports: [UsuarioService],
})
export class UsuarioModule {}
