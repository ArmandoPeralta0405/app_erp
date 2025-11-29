import { Module } from '@nestjs/common';
import { LineaService } from './linea.service';
import { LineaController } from './linea.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [LineaController],
    providers: [LineaService],
})
export class LineaModule { }
