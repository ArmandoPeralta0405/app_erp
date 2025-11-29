import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ArticuloService } from './articulo.service';
import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';


@Controller('articulo')
@UseGuards(AuthGuard('jwt'))
export class ArticuloController {
    constructor(private readonly articuloService: ArticuloService) { }

    @Post()

    create(@Body() createDto: CreateArticuloDto) {
        return this.articuloService.create(createDto);
    }

    @Get()

    findAll() {
        return this.articuloService.findAll();
    }

    @Get(':id')

    findOne(@Param('id') id: string) {
        return this.articuloService.findOne(+id);
    }

    @Patch(':id')

    update(@Param('id') id: string, @Body() updateDto: UpdateArticuloDto) {
        return this.articuloService.update(+id, updateDto);
    }

    @Delete(':id')

    remove(@Param('id') id: string) {
        return this.articuloService.remove(+id);
    }
}
