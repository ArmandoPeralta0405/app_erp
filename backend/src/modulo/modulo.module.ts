// src/modulo/modulo.module.ts

import { Module } from '@nestjs/common';
import { ModuloService } from './modulo.service';
import { ModuloController } from './modulo.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Importar Prisma

@Module({
  imports: [PrismaModule], // Conexión a Prisma
  controllers: [ModuloController],
  providers: [ModuloService],
})
export class ModuloModule {}
