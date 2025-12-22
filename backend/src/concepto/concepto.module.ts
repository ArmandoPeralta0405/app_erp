import { Module } from '@nestjs/common';
import { ConceptoService } from './concepto.service';
import { ConceptoController } from './concepto.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [ConceptoController],
    providers: [ConceptoService, PrismaService],
})
export class ConceptoModule { }
