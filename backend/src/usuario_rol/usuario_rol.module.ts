// src/usuario_rol/usuario_rol.module.ts (Código Corregido y Completo)

import { Module } from '@nestjs/common';
import { UsuarioRolService } from './usuario_rol.service';
import { UsuarioRolController } from './usuario_rol.controller';
import { PrismaModule } from '../prisma/prisma.module'; // 💡 PASO 1: Importar

@Module({
  imports: [PrismaModule], // 💡 PASO 2: Añadir al arreglo 'imports'
  controllers: [UsuarioRolController],
  providers: [UsuarioRolService],
})
export class UsuarioRolModule {}
