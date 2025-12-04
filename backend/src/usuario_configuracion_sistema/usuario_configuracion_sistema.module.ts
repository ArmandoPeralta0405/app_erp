import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsuarioConfiguracionSistemaController } from './usuario_configuracion_sistema.controller';
import { UsuarioConfiguracionSistemaService } from './usuario_configuracion_sistema.service';

@Module({
    imports: [PrismaModule],
    controllers: [UsuarioConfiguracionSistemaController],
    providers: [UsuarioConfiguracionSistemaService],
    exports: [UsuarioConfiguracionSistemaService]
})
export class UsuarioConfiguracionSistemaModule { }
