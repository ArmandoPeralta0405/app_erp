import { Module } from '@nestjs/common';
import { AjusteInventarioService } from './ajuste-inventario.service';
import { AjusteInventarioController } from './ajuste-inventario.controller';
import { MovimientoStockModule } from '../movimiento-stock/movimiento-stock.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule, MovimientoStockModule],
    controllers: [AjusteInventarioController],
    providers: [AjusteInventarioService],
})
export class AjusteInventarioModule { }
