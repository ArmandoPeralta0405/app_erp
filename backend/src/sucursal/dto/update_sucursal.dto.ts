// src/sucursal/dto/update_sucursal.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateSucursalDto } from './create_sucursal.dto';

// Hace todos los campos opcionales, pero mantiene las validaciones de formato/longitud.
export class UpdateSucursalDto extends PartialType(CreateSucursalDto) {}
