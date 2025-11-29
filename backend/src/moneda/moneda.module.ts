// src/moneda/moneda.module.ts

import { Module } from '@nestjs/common';
import { MonedaService } from './moneda.service';
import { MonedaController } from './moneda.controller';
import { PrismaModule } from '../prisma/prisma.module'; // 💡 Importar Prisma

@Module({
  imports: [PrismaModule], // 💡 Agregado aquí
  controllers: [MonedaController],
  providers: [MonedaService],
})
export class MonedaModule {}
