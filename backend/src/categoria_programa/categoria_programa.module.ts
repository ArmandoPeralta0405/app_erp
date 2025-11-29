// src/categoria-programa/categoria-programa.module.ts

import { Module } from '@nestjs/common';
import { CategoriaProgramaService } from './categoria_programa.service';
import { CategoriaProgramaController } from './categoria_programa.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Importar Prisma

@Module({
  imports: [PrismaModule], // Conexión a Prisma
  controllers: [CategoriaProgramaController],
  providers: [CategoriaProgramaService],
})
export class CategoriaProgramaModule {}
