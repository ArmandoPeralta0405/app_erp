import { Module } from '@nestjs/common';
import { ArticuloService } from './articulo.service';
import { ArticuloController } from './articulo.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ArticuloController],
    providers: [ArticuloService],
    exports: [ArticuloService],
})
export class ArticuloModule { }
