import { Module } from '@nestjs/common';
import { MovimientoStockController } from './movimiento-stock.controller';
import { MovimientoStockService } from './movimiento-stock.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [MovimientoStockController],
    providers: [MovimientoStockService],
    exports: [MovimientoStockService],
})
export class MovimientoStockModule { }
