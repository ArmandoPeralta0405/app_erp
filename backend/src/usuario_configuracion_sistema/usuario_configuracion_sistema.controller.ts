import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsuarioConfiguracionSistemaService } from './usuario_configuracion_sistema.service';
import { CreateUsuarioConfiguracionSistemaDto } from './dto/create-usuario_configuracion_sistema.dto';

@Controller('usuario-configuracion-sistema')
@UseGuards(AuthGuard('jwt'))
export class UsuarioConfiguracionSistemaController {
    constructor(private readonly service: UsuarioConfiguracionSistemaService) { }

    @Post()
    create(@Body() createDto: CreateUsuarioConfiguracionSistemaDto) {
        return this.service.create(createDto);
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get('usuario/:id_usuario')
    findByUsuario(@Param('id_usuario', ParseIntPipe) id_usuario: number) {
        return this.service.findByUsuario(id_usuario);
    }

    @Get('configuracion/:id_configuracion_sistema')
    findByConfiguracion(@Param('id_configuracion_sistema', ParseIntPipe) id_configuracion_sistema: number) {
        return this.service.findByConfiguracion(id_configuracion_sistema);
    }

    @Get(':id_usuario/:id_configuracion_sistema')
    findOne(
        @Param('id_usuario', ParseIntPipe) id_usuario: number,
        @Param('id_configuracion_sistema', ParseIntPipe) id_configuracion_sistema: number
    ) {
        return this.service.findOne(id_usuario, id_configuracion_sistema);
    }

    @Delete(':id_usuario/:id_configuracion_sistema')
    remove(
        @Param('id_usuario', ParseIntPipe) id_usuario: number,
        @Param('id_configuracion_sistema', ParseIntPipe) id_configuracion_sistema: number
    ) {
        return this.service.remove(id_usuario, id_configuracion_sistema);
    }

    @Delete('usuario/:id_usuario')
    removeAllByUsuario(@Param('id_usuario', ParseIntPipe) id_usuario: number) {
        return this.service.removeAllByUsuario(id_usuario);
    }

    @Delete('configuracion/:id_configuracion_sistema')
    removeAllByConfiguracion(@Param('id_configuracion_sistema', ParseIntPipe) id_configuracion_sistema: number) {
        return this.service.removeAllByConfiguracion(id_configuracion_sistema);
    }
}
