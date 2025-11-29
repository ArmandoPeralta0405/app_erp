// src/categoria_programa/dto/create_categoria_programa.dto.ts

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCategoriaProgramaDto {
  // NOMBRE (Obligatorio)
  @IsNotEmpty({ message: 'El nombre de la categoría no puede estar vacío.' })
  @IsString({ message: 'El nombre debe ser texto.' })
  @MaxLength(150, { message: 'El nombre debe tener menos de 150 caracteres.' })
  readonly nombre: string;

  // DESCRIPCION (Opcional, pero debe ser texto si se proporciona)
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto.' })
  @MaxLength(250, {
    message: 'La descripción debe tener menos de 250 caracteres.',
  })
  readonly descripcion?: string;

  // ESTADO (Opcional, default: true)
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano (true/false).' })
  readonly estado?: boolean;
}
