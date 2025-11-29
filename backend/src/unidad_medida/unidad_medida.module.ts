import { Module } from '@nestjs/common';
import { UnidadMedidaService } from './unidad_medida.service';
import { UnidadMedidaController } from './unidad_medida.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    controllers: [UnidadMedidaController],
    providers: [UnidadMedidaService],
    imports: [PrismaModule]
})
export class UnidadMedidaModule { }
