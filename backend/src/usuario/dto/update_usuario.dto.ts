// src/usuario/dto/update_usuario.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create_usuario.dto';

// Hace todos los campos definidos en CreateUsuarioDto opcionales,
// manteniendo las validaciones de MaxLength, IsString, etc.
export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}
