import { Module } from '@nestjs/common';
import { CiudadService } from './ciudad.service';
import { CiudadController } from './ciudad.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [CiudadController],
    providers: [CiudadService, PrismaService],
})
export class CiudadModule { }
