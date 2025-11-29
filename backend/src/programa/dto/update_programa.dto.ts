// src/programa/dto/update_programa.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramaDto } from './create_programa.dto';

// Hace todos los campos opcionales, manteniendo sus validaciones.
export class UpdateProgramaDto extends PartialType(CreateProgramaDto) {}
