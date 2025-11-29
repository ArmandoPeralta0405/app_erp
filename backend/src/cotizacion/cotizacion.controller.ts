import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CotizacionService } from './cotizacion.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { UpdateCotizacionDto } from './dto/update-cotizacion.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('cotizacion')
export class CotizacionController {
    constructor(private readonly cotizacionService: CotizacionService) { }

    @Post()
    create(@Body() createCotizacionDto: CreateCotizacionDto) {
        return this.cotizacionService.create(createCotizacionDto);
    }

    @Get()
    findAll() {
        return this.cotizacionService.findAll();
    }

    @Get(':id_moneda/:fecha')
    findOne(
        @Param('id_moneda', ParseIntPipe) id_moneda: number,
        @Param('fecha') fecha: string
    ) {
        return this.cotizacionService.findOne(id_moneda, fecha);
    }

    @Patch(':id_moneda/:fecha')
    update(
        @Param('id_moneda', ParseIntPipe) id_moneda: number,
        @Param('fecha') fecha: string,
        @Body() updateCotizacionDto: UpdateCotizacionDto
    ) {
        return this.cotizacionService.update(id_moneda, fecha, updateCotizacionDto);
    }

    @Delete(':id_moneda/:fecha')
    remove(
        @Param('id_moneda', ParseIntPipe) id_moneda: number,
        @Param('fecha') fecha: string
    ) {
        return this.cotizacionService.remove(id_moneda, fecha);
    }
}
