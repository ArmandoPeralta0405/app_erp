// src/empresa/empresa.module.ts

import { Module } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { PrismaModule } from '../prisma/prisma.module'; // 💡 Importación crucial

@Module({
  imports: [PrismaModule], // 💡 Agregado aquí
  controllers: [EmpresaController],
  providers: [EmpresaService],
})
export class EmpresaModule {}
