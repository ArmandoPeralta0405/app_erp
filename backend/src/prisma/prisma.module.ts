// src/prisma/prisma.module.ts

import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  // 💡 Exporta el servicio para que esté disponible globalmente
  exports: [PrismaService],
})
export class PrismaModule {}
