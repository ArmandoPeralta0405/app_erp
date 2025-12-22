import { Module } from '@nestjs/common';
import { CuentaContableService } from './cuenta_contable.service';
import { CuentaContableController } from './cuenta_contable.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [CuentaContableController],
    providers: [CuentaContableService, PrismaService],
})
export class CuentaContableModule { }
