// src/rol/dto/update-rol.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateRolDto } from './create_rol.dto';

// Hace todos los campos opcionales, manteniendo sus validaciones.
export class UpdateRolDto extends PartialType(CreateRolDto) {}
