// src/deposito/dto/update-deposito.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateDepositoDto } from './create_deposito.dto';

// Hace todos los campos opcionales, manteniendo sus validaciones.
export class UpdateDepositoDto extends PartialType(CreateDepositoDto) {}
