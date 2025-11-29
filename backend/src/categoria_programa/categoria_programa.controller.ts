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
import { CategoriaProgramaService } from './categoria_programa.service';
import { CreateCategoriaProgramaDto } from './dto/create_categoria_programa.dto';
import { UpdateCategoriaProgramaDto } from './dto/update_categoria_programa.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('categoria_programa')
export class CategoriaProgramaController {
  constructor(
    private readonly categoriaProgramaService: CategoriaProgramaService,
  ) { }

  @Get()
  async findAll() {
    return this.categoriaProgramaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriaProgramaService.findOne(id);
  }

  @Post()
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createCategoriaProgramaDto: CreateCategoriaProgramaDto,
  ) {
    return this.categoriaProgramaService.create(createCategoriaProgramaDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateCategoriaProgramaDto: UpdateCategoriaProgramaDto,
  ) {
    return this.categoriaProgramaService.update(id, updateCategoriaProgramaDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriaProgramaService.remove(id);
  }
}
