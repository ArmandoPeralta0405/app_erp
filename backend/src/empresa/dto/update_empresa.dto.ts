// src/empresa/dto/update_empresa.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpresaDto } from './create_empresa.dto';

// Hereda las reglas de CreateEmpresaDto y hace todos los campos opcionales.
export class UpdateEmpresaDto extends PartialType(CreateEmpresaDto) {}
