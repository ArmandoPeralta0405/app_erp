import { Module } from '@nestjs/common';
import { ConfiguracionSistemaService } from './configuracion_sistema.service';
import { ConfiguracionSistemaController } from './configuracion_sistema.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ConfiguracionSistemaController],
    providers: [ConfiguracionSistemaService],
})
export class ConfiguracionSistemaModule { }
