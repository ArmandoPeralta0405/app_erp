import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { AjusteInventarioService } from './ajuste-inventario.service';
import { CreateAjusteInventarioDto } from './dto/create-ajuste-inventario.dto';

@Controller('ajuste-inventario')
export class AjusteInventarioController {
    constructor(private readonly ajusteInventarioService: AjusteInventarioService) { }

    @Post()
    create(@Body() createDto: CreateAjusteInventarioDto) {
        return this.ajusteInventarioService.create(createDto);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.ajusteInventarioService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.ajusteInventarioService.findOne(id);
    }

    @Get('check-config/:id_usuario')
    checkConfig(@Param('id_usuario', ParseIntPipe) id_usuario: number) {
        return this.ajusteInventarioService.checkConfig(id_usuario);
    }


    @Get('next-number/:id_usuario')
    getNextNumber(@Param('id_usuario', ParseIntPipe) id_usuario: number) {
        return this.ajusteInventarioService.getNextNumber(id_usuario);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.ajusteInventarioService.remove(id);
    }
}
