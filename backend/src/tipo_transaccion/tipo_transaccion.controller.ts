import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TipoTransaccionService } from './tipo_transaccion.service';
import { CreateTipoTransaccionDto } from './dto/create-tipo_transaccion.dto';
import { UpdateTipoTransaccionDto } from './dto/update-tipo_transaccion.dto';

@Controller('tipo-transaccion')
@UseGuards(AuthGuard('jwt'))
export class TipoTransaccionController {
    constructor(private readonly tipoTransaccionService: TipoTransaccionService) { }

    @Post()
    create(@Body() createDto: CreateTipoTransaccionDto) {
        return this.tipoTransaccionService.create(createDto);
    }

    @Get()
    findAll() {
        return this.tipoTransaccionService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tipoTransaccionService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateTipoTransaccionDto) {
        return this.tipoTransaccionService.update(+id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tipoTransaccionService.remove(+id);
    }
}
