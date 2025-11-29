// src/categoria_programa/dto/update_categoria_programa.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaProgramaDto } from './create_categoria_programa.dto';

// Hace todos los campos opcionales, manteniendo sus validaciones.
export class UpdateCategoriaProgramaDto extends PartialType(
  CreateCategoriaProgramaDto,
) {}
