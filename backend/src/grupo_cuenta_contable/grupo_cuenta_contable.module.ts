import { Module } from '@nestjs/common';
import { GrupoCuentaContableService } from './grupo_cuenta_contable.service';
import { GrupoCuentaContableController } from './grupo_cuenta_contable.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [GrupoCuentaContableController],
    providers: [GrupoCuentaContableService, PrismaService],
})
export class GrupoCuentaContableModule { }
