import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaisService } from './pais.service';
import { CreatePaisDto } from './dto/create-pais.dto';
import { UpdatePaisDto } from './dto/update-pais.dto';

@Controller('pais')
@UseGuards(AuthGuard('jwt'))
export class PaisController {
    constructor(private readonly paisService: PaisService) { }

    @Post()
    create(@Body() createPaisDto: CreatePaisDto) {
        return this.paisService.create(createPaisDto);
    }

    @Get()
    findAll() {
        return this.paisService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.paisService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updatePaisDto: UpdatePaisDto) {
        return this.paisService.update(id, updatePaisDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.paisService.remove(id);
    }
}
