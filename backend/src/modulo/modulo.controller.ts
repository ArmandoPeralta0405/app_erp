import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ModuloService } from './modulo.service';
import { CreateModuloDto } from './dto/create_modulo.dto';
import { UpdateModuloDto } from './dto/update_modulo.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('modulo')
export class ModuloController {
  constructor(private readonly moduloService: ModuloService) { }

  @Get()
  async findAll() {
    return this.moduloService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.moduloService.findOne(id);
  }

  @Post()
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createModuloDto: CreateModuloDto,
  ) {
    return this.moduloService.create(createModuloDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateModuloDto: UpdateModuloDto,
  ) {
    return this.moduloService.update(id, updateModuloDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.moduloService.remove(id);
  }
}
