import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { UsuarioTerminalService } from './usuario_terminal.service';
import {
    CreateUsuarioTerminalDto,
    AssignUsuariosToTerminalDto,
    AssignTerminalesToUsuarioDto,
} from './dto/create-usuario_terminal.dto';

@Controller('usuario-terminal')
export class UsuarioTerminalController {
    constructor(
        private readonly usuarioTerminalService: UsuarioTerminalService,
    ) { }

    @Post()
    create(@Body() createDto: CreateUsuarioTerminalDto) {
        return this.usuarioTerminalService.create(createDto);
    }

    @Get()
    findAll() {
        return this.usuarioTerminalService.findAll();
    }

    @Get('usuario/:id_usuario')
    findByUsuario(@Param('id_usuario', ParseIntPipe) id_usuario: number) {
        return this.usuarioTerminalService.findByUsuario(id_usuario);
    }

    @Get('terminal/:id_terminal')
    findByTerminal(@Param('id_terminal', ParseIntPipe) id_terminal: number) {
        return this.usuarioTerminalService.findByTerminal(id_terminal);
    }

    @Get(':id_usuario/:id_terminal')
    findOne(
        @Param('id_usuario', ParseIntPipe) id_usuario: number,
        @Param('id_terminal', ParseIntPipe) id_terminal: number,
    ) {
        return this.usuarioTerminalService.findOne(id_usuario, id_terminal);
    }

    @Delete(':id_usuario/:id_terminal')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(
        @Param('id_usuario', ParseIntPipe) id_usuario: number,
        @Param('id_terminal', ParseIntPipe) id_terminal: number,
    ) {
        return this.usuarioTerminalService.remove(id_usuario, id_terminal);
    }

    @Post('assign-usuarios-to-terminal')
    assignUsuariosToTerminal(@Body() assignDto: AssignUsuariosToTerminalDto) {
        return this.usuarioTerminalService.assignUsuariosToTerminal(assignDto);
    }

    @Post('assign-terminales-to-usuario')
    assignTerminalesToUsuario(@Body() assignDto: AssignTerminalesToUsuarioDto) {
        return this.usuarioTerminalService.assignTerminalesToUsuario(assignDto);
    }
}
