import { Module } from '@nestjs/common';
import { UsuarioTerminalService } from './usuario_terminal.service';
import { UsuarioTerminalController } from './usuario_terminal.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [UsuarioTerminalController],
    providers: [UsuarioTerminalService],
    exports: [UsuarioTerminalService],
})
export class UsuarioTerminalModule { }
