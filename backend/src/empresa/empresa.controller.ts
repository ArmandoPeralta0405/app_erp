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
  Query,
} from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { CreateEmpresaDto } from './dto/create_empresa.dto';
import { UpdateEmpresaDto } from './dto/update_empresa.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) { }

  // 1. OBTENER TODAS LAS EMPRESAS (GET /empresa)
  @Get()
  async findAll() {
    return this.empresaService.findAll();
  }

  // 2. CALCULAR DÍGITO VERIFICADOR (GET /empresa/calcular-dv?ruc=5955455)
  @Get('calcular-dv')
  async calcularDV(@Query('ruc') ruc: string) {
    const dv = await this.empresaService.calcularDV(ruc);
    return {
      ruc: ruc,
      dv: dv,
      ruc_completo: `${ruc}-${dv}`,
    };
  }

  // 3. VALIDAR RUC COMPLETO (GET /empresa/validar-ruc?ruc=59554550)
  @Get('validar-ruc')
  async validarRUC(@Query('ruc') ruc: string) {
    const esValido = await this.empresaService.validarRUC(ruc);
    return {
      ruc: ruc,
      es_valido: esValido,
    };
  }

  // 4. OBTENER UNA EMPRESA POR ID (GET /empresa/:id)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.empresaService.findOne(id);
  }

  // 5. CREAR UNA NUEVA EMPRESA (POST /empresa)
  @Post()
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createEmpresaDto: CreateEmpresaDto,
  ) {
    return this.empresaService.create(createEmpresaDto);
  }

  // 6. ACTUALIZAR UNA EMPRESA (PATCH /empresa/:id)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateEmpresaDto: UpdateEmpresaDto,
  ) {
    return this.empresaService.update(id, updateEmpresaDto);
  }

  // 7. ELIMINACIÓN LÓGICA (DELETE /empresa/:id)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.empresaService.remove(id);
  }
}
