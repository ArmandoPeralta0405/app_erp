import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClaseDocumentoService } from './clase_documento.service';
import { CreateClaseDocumentoDto } from './dto/create-clase_documento.dto';
import { UpdateClaseDocumentoDto } from './dto/update-clase_documento.dto';

@Controller('clase-documento')
@UseGuards(AuthGuard('jwt'))
export class ClaseDocumentoController {
    constructor(private readonly claseDocumentoService: ClaseDocumentoService) { }

    @Post()
    create(@Body() createDto: CreateClaseDocumentoDto) {
        return this.claseDocumentoService.create(createDto);
    }

    @Get()
    findAll() {
        return this.claseDocumentoService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.claseDocumentoService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateClaseDocumentoDto) {
        return this.claseDocumentoService.update(+id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.claseDocumentoService.remove(+id);
    }
}
