import { Module } from '@nestjs/common';
import { ImpuestoService } from './impuesto.service';
import { ImpuestoController } from './impuesto.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [ImpuestoController],
    providers: [ImpuestoService, PrismaService],
})
export class ImpuestoModule { }
