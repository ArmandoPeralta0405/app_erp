import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CiudadService } from './ciudad.service';
import { CreateCiudadDto } from './dto/create-ciudad.dto';
import { UpdateCiudadDto } from './dto/update-ciudad.dto';


@Controller('ciudad')
@UseGuards(AuthGuard('jwt'))
export class CiudadController {
    constructor(private readonly ciudadService: CiudadService) { }

    @Post()

    create(@Body() createDto: CreateCiudadDto) {
        return this.ciudadService.create(createDto);
    }

    @Get()

    findAll() {
        return this.ciudadService.findAll();
    }

    @Get(':id')

    findOne(@Param('id') id: string) {
        return this.ciudadService.findOne(+id);
    }

    @Patch(':id')

    update(@Param('id') id: string, @Body() updateDto: UpdateCiudadDto) {
        return this.ciudadService.update(+id, updateDto);
    }

    @Delete(':id')

    remove(@Param('id') id: string) {
        return this.ciudadService.remove(+id);
    }
}
