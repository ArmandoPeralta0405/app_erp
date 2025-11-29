// src/rol/rol.module.ts

import { Module } from '@nestjs/common';
import { RolService } from './rol.service';
import { RolController } from './rol.controller';
import { PrismaModule } from '../prisma/prisma.module'; // 💡 Importación crucial

@Module({
  // 💡 Importamos PrismaModule para que RolService pueda inyectar PrismaService
  imports: [PrismaModule],
  controllers: [RolController],
  providers: [RolService],
})
export class RolModule {}
