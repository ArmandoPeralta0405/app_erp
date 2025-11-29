// src/moneda/dto/update-moneda.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateMonedaDto } from './create_moneda.dto';

// Hace todos los campos opcionales, manteniendo sus validaciones.
export class UpdateMonedaDto extends PartialType(CreateMonedaDto) {}
