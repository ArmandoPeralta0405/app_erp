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
import { RolService } from './rol.service';
import { rol as RolModel } from '@prisma/client';
import { CreateRolDto } from './dto/create_rol.dto';
import { UpdateRolDto } from './dto/update_rol.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('rol')
export class RolController {
  constructor(private readonly rolService: RolService) { }

  @Get()
  async findAll() {
    return this.rolService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolService.findOne(id);
  }

  @Post()
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createRolDto: CreateRolDto,
  ): Promise<RolModel> {
    return this.rolService.create(createRolDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateRolDto: UpdateRolDto,
  ): Promise<RolModel> {
    return this.rolService.update(id, updateRolDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<RolModel> {
    return this.rolService.remove(id);
  }
}
