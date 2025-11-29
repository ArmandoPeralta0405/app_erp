import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DepartamentoService } from './departamento.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';

@Controller('departamento')
@UseGuards(AuthGuard('jwt'))
export class DepartamentoController {
  constructor(private readonly departamentoService: DepartamentoService) { }

  @Post()
  create(@Body() createDto: CreateDepartamentoDto) {
    return this.departamentoService.create(createDto);
  }

  @Get()
  findAll() {
    return this.departamentoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departamentoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateDepartamentoDto) {
    return this.departamentoService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departamentoService.remove(+id);
  }
}
