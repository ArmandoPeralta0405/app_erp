import { Module } from '@nestjs/common';
import { ArticuloCodigoBarraService } from './articulo_codigo_barra.service';
import { ArticuloCodigoBarraController } from './articulo_codigo_barra.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ArticuloCodigoBarraController],
    providers: [ArticuloCodigoBarraService],
    exports: [ArticuloCodigoBarraService],
})
export class ArticuloCodigoBarraModule { }
