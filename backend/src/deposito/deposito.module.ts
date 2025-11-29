// src/deposito/deposito.module.ts

import { Module } from '@nestjs/common';
import { DepositoService } from './deposito.service';
import { DepositoController } from './deposito.controller';
import { PrismaModule } from '../prisma/prisma.module'; // 💡 Importar Prisma

@Module({
  imports: [PrismaModule], // 💡 Agregado aquí
  controllers: [DepositoController],
  providers: [DepositoService],
})
export class DepositoModule {}
