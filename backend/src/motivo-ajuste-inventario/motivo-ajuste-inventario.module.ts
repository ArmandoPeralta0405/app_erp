import { Module } from '@nestjs/common';
import { MotivoAjusteInventarioService } from './motivo-ajuste-inventario.service';
import { MotivoAjusteInventarioController } from './motivo-ajuste-inventario.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [MotivoAjusteInventarioController],
    providers: [MotivoAjusteInventarioService, PrismaService],
})
export class MotivoAjusteInventarioModule { }
