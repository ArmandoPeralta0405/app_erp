// src/programa/programa.controller.ts (Versión con DTOs)

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  ValidationPipe, // 💡 Importar ValidationPipe
  UseGuards, // 💡 Importar UseGuards
} from '@nestjs/common';
import { ProgramaService } from './programa.service';
// 💡 Importar DTOs
import { CreateProgramaDto } from './dto/create_programa.dto';
import { UpdateProgramaDto } from './dto/update_programa.dto';
import { AuthGuard } from '@nestjs/passport'; // 💡 Importar AuthGuard

// ❌ Eliminamos los tipos manuales
// type CreateProgramaData = Omit<ProgramaModel, 'id_programa'>;
// type UpdateProgramaData = Partial<Omit<ProgramaModel, 'id_programa'>>;

@UseGuards(AuthGuard('jwt'))
@Controller('programa')
export class ProgramaController {
  constructor(private readonly programaService: ProgramaService) { }

  // 1. OBTENER TODOS LOS PROGRAMAS (GET /programa)
  @Get()
  async findAll() {
    return this.programaService.findAll();
  }

  // 2. OBTENER UN PROGRAMA POR ID (GET /programa/1)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.programaService.findOne(id);
  }

  // 3. CREAR UN NUEVO PROGRAMA (POST /programa) (💡 Usamos DTO y ValidationPipe)
  @Post()
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createProgramaDto: CreateProgramaDto,
  ) {
    return this.programaService.create(createProgramaDto);
  }

  // 4. ACTUALIZAR UN PROGRAMA (PATCH /programa/1) (💡 Usamos DTO y ValidationPipe)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateProgramaDto: UpdateProgramaDto,
  ) {
    return this.programaService.update(id, updateProgramaDto);
  }

  // 5. ELIMINACIÓN LÓGICA (DELETE /programa/1)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.programaService.remove(id);
  }
}
