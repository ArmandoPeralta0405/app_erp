import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MotivoAjusteInventarioService } from './motivo-ajuste-inventario.service';
import { CreateMotivoAjusteInventarioDto } from './dto/create-motivo-ajuste-inventario.dto';
import { UpdateMotivoAjusteInventarioDto } from './dto/update-motivo-ajuste-inventario.dto';

@Controller('motivo-ajuste-inventario')
@UseGuards(AuthGuard('jwt'))
export class MotivoAjusteInventarioController {
    constructor(private readonly motivoService: MotivoAjusteInventarioService) { }

    @Post()
    create(@Body() createDto: CreateMotivoAjusteInventarioDto) {
        return this.motivoService.create(createDto);
    }

    @Get()
    findAll() {
        return this.motivoService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.motivoService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateMotivoAjusteInventarioDto) {
        return this.motivoService.update(+id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.motivoService.remove(+id);
    }
}
