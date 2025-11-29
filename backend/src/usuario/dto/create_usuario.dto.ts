// src/usuario/dto/create_usuario.dto.ts

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
  // NOMBRE (Obligatorio, max 150)
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @IsString({ message: 'El nombre debe ser texto.' })
  @MaxLength(150, { message: 'El nombre debe tener menos de 150 caracteres.' })
  readonly nombre: string;

  // APELLIDO (Obligatorio, max 150)
  @IsNotEmpty({ message: 'El apellido es obligatorio.' })
  @IsString({ message: 'El apellido debe ser texto.' })
  @MaxLength(150, {
    message: 'El apellido debe tener menos de 150 caracteres.',
  })
  readonly apellido: string;

  // ALIAS (Obligatorio, Único, max 50)
  @IsNotEmpty({ message: 'El alias (nombre de usuario) es obligatorio.' })
  @IsString({ message: 'El alias debe ser texto.' })
  @MaxLength(50, { message: 'El alias debe tener menos de 50 caracteres.' })
  readonly alias: string;

  // CLAVE (Obligatoria, max 250, Min 6 recomendado)
  @IsNotEmpty({ message: 'La clave es obligatoria.' })
  @IsString({ message: 'La clave debe ser texto.' })
  @MinLength(6, { message: 'La clave debe tener al menos 6 caracteres.' })
  @MaxLength(250, {
    message: 'La clave debe tener menos de 250 caracteres.',
  })
  readonly clave: string;

  // CEDULA (Opcional, max 20)
  @IsOptional()
  @IsString({ message: 'La cédula debe ser texto.' })
  @MaxLength(20, { message: 'La cédula debe tener menos de 20 caracteres.' })
  readonly cedula?: string;

  // TELEFONO (Opcional, max 25)
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto.' })
  @MaxLength(25, { message: 'El teléfono debe tener menos de 25 caracteres.' })
  readonly telefono?: string;

  // DIRECCION (Opcional, max 500)
  @IsOptional()
  @IsString({ message: 'La dirección debe ser texto.' })
  @MaxLength(500, {
    message: 'La dirección debe tener menos de 500 caracteres.',
  })
  readonly direccion?: string;

  // ESTADO (Opcional, default: true)
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano.' })
  readonly estado?: boolean;
}
