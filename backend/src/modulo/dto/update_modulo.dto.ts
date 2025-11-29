// src/modulo/dto/update_modulo.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateModuloDto } from './create_modulo.dto';

// Hace todos los campos opcionales, manteniendo sus validaciones.
export class UpdateModuloDto extends PartialType(CreateModuloDto) {}
