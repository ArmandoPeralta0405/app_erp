// src/programa/programa.module.ts

import { Module } from '@nestjs/common';
import { ProgramaService } from './programa.service';
import { ProgramaController } from './programa.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Importar Prisma

@Module({
  imports: [PrismaModule], // Conexión a Prisma
  controllers: [ProgramaController],
  providers: [ProgramaService],
})
export class ProgramaModule {}
