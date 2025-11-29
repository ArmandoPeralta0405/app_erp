// src/rol_programa/rol_programa.module.ts

import { Module } from '@nestjs/common';
import { RolProgramaService } from './rol_programa.service';
import { RolProgramaController } from './rol_programa.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RolProgramaController],
  providers: [RolProgramaService],
})
export class RolProgramaModule {}
