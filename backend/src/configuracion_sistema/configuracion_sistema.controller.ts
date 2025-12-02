import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfiguracionSistemaService } from './configuracion_sistema.service';
import { CreateConfiguracionSistemaDto } from './dto/create-configuracion_sistema.dto';
import { UpdateConfiguracionSistemaDto } from './dto/update-configuracion_sistema.dto';

@Controller('configuracion-sistema')
@UseGuards(AuthGuard('jwt'))
export class ConfiguracionSistemaController {
    constructor(private readonly configuracionSistemaService: ConfiguracionSistemaService) { }

    @Post()
    create(@Body() createDto: CreateConfiguracionSistemaDto) {
        return this.configuracionSistemaService.create(createDto);
    }

    @Get()
    findAll() {
        return this.configuracionSistemaService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.configuracionSistemaService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateConfiguracionSistemaDto) {
        return this.configuracionSistemaService.update(+id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.configuracionSistemaService.remove(+id);
    }
}
