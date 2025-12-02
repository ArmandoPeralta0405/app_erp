import { Module } from '@nestjs/common';
import { Tipo_articuloService } from './tipo_articulo.service';
import { Tipo_articuloController } from './tipo_articulo.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [Tipo_articuloController],
    providers: [Tipo_articuloService],
})
export class Tipo_articuloModule { }
