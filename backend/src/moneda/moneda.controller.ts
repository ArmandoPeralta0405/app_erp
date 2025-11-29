import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete, ValidationPipe, UseGuards } from '@nestjs/common';
import { MonedaService } from './moneda.service';
import { moneda as MonedaModel } from '@prisma/client';
import { CreateMonedaDto } from './dto/create_moneda.dto';
import { UpdateMonedaDto } from './dto/update_moneda.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('moneda')
export class MonedaController {
  constructor(private readonly monedaService: MonedaService) { }

  @Get()
  async findAll() {
    return this.monedaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.monedaService.findOne(id);
  }

  @Post()
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createMonedaDto: CreateMonedaDto,
  ) {
    return this.monedaService.create(createMonedaDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateMonedaDto: UpdateMonedaDto,
  ) {
    return this.monedaService.update(id, updateMonedaDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.monedaService.remove(id);
  }
}
