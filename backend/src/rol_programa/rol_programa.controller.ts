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
import { RolProgramaService } from './rol_programa.service';
import { CreateRolProgramaDto } from './dto/create_rol_programa.dto';
import { UpdateRolProgramaDto } from './dto/update_rol_programa.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('rol_programa')
export class RolProgramaController {
  constructor(private readonly rolProgramaService: RolProgramaService) { }

  @Get()
  async findAll() {
    return this.rolProgramaService.findAll();
  }

  @Get('rol/:rolId/programa/:programaId')
  async findOne(
    @Param('rolId', ParseIntPipe) rolId: number,
    @Param('programaId', ParseIntPipe) programaId: number,
  ) {
    return this.rolProgramaService.findOne({
      id_rol_id_programa: { id_rol: rolId, id_programa: programaId },
    });
  }

  @Post()
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createRolProgramaDto: CreateRolProgramaDto,
  ) {
    return this.rolProgramaService.create(createRolProgramaDto);
  }

  @Patch('rol/:rolId/programa/:programaId')
  async update(
    @Param('rolId', ParseIntPipe) rolId: number,
    @Param('programaId', ParseIntPipe) programaId: number,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateRolProgramaDto: UpdateRolProgramaDto,
  ) {
    return this.rolProgramaService.update(
      { id_rol_id_programa: { id_rol: rolId, id_programa: programaId } },
      updateRolProgramaDto,
    );
  }

  @Delete('rol/:rolId/programa/:programaId')
  async remove(
    @Param('rolId', ParseIntPipe) rolId: number,
    @Param('programaId', ParseIntPipe) programaId: number,
  ) {
    return this.rolProgramaService.remove({
      id_rol_id_programa: { id_rol: rolId, id_programa: programaId },
    });
  }
}
