import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { Tipo_articuloService } from './tipo_articulo.service';
import { CreateTipo_articuloDto } from './dto/create-tipo_articulo.dto';
import { UpdateTipo_articuloDto } from './dto/update-tipo_articulo.dto';

@Controller('tipo_articulo')
export class Tipo_articuloController {
    constructor(private readonly tipo_articuloService: Tipo_articuloService) { }

    @Post()
    create(@Body() createTipo_articuloDto: CreateTipo_articuloDto) {
        return this.tipo_articuloService.create(createTipo_articuloDto);
    }

    @Get()
    findAll() {
        return this.tipo_articuloService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.tipo_articuloService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateTipo_articuloDto: UpdateTipo_articuloDto) {
        return this.tipo_articuloService.update(id, updateTipo_articuloDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.tipo_articuloService.remove(id);
    }
}
