// src/sucursal/sucursal.module.ts

import { Module } from '@nestjs/common';
import { SucursalService } from './sucursal.service';
import { SucursalController } from './sucursal.controller';
import { PrismaModule } from '../prisma/prisma.module'; // 💡 Importar Prisma

@Module({
  imports: [PrismaModule], // 💡 Agregado aquí
  controllers: [SucursalController],
  providers: [SucursalService],
})
export class SucursalModule {}
