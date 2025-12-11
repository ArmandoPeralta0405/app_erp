import { Module } from '@nestjs/common';
import { AjusteInventarioService } from './ajuste-inventario.service';
import { AjusteInventarioController } from './ajuste-inventario.controller';
import { MovimientoStockModule } from '../movimiento-stock/movimiento-stock.module';
import { PrismaModule } from '../prisma/prisma.module';

import { ReportsModule } from '../reports/reports.module';

@Module({
    imports: [PrismaModule, MovimientoStockModule, ReportsModule],
    controllers: [AjusteInventarioController],
    providers: [AjusteInventarioService],
})
export class AjusteInventarioModule { }
