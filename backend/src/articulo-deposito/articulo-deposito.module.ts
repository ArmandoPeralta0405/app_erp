import { Module } from '@nestjs/common';
import { ArticuloDepositoController } from './articulo-deposito.controller';
import { ArticuloDepositoService } from './articulo-deposito.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ArticuloDepositoController],
    providers: [ArticuloDepositoService],
    exports: [ArticuloDepositoService],
})
export class ArticuloDepositoModule { }
