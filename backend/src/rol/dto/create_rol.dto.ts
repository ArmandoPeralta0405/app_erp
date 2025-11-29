// src/rol/dto/create_rol.dto.ts

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateRolDto {
  // NOMBRE (Obligatorio)
  @IsNotEmpty({ message: 'El nombre del rol es obligatorio.' })
  @IsString({ message: 'El nombre debe ser texto.' })
  @MaxLength(150, { message: 'El nombre debe tener menos de 150 caracteres.' })
  readonly nombre: string;

  // DESCRIPCIÓN (Opcional)
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto.' })
  @MaxLength(250, {
    message: 'La descripción debe tener menos de 250 caracteres.',
  })
  readonly descripcion?: string;

  // ESTADO (Opcional, default: true)
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano.' })
  readonly estado?: boolean;
}
