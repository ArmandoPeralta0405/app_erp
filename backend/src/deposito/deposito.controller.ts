import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DepositoService } from './deposito.service';
import { CreateDepositoDto } from './dto/create_deposito.dto';
import { UpdateDepositoDto } from './dto/update_deposito.dto';

@Controller('deposito')
@UseGuards(AuthGuard('jwt'))
export class DepositoController {
  constructor(private readonly depositoService: DepositoService) { }

  @Post()
  create(@Body() createDto: CreateDepositoDto) {
    return this.depositoService.create(createDto);
  }

  @Get()
  findAll() {
    return this.depositoService.findAll();
  }

  @Get('sucursal/:id')
  findBySucursal(@Param('id') id: string) {
    return this.depositoService.findBySucursal(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.depositoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateDepositoDto) {
    return this.depositoService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.depositoService.remove(+id);
  }
}
