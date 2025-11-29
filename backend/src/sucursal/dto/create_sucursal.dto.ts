// src/sucursal/dto/create_sucursal.dto.ts

import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Length,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateSucursalDto {
  // ID_EMPRESA (Clave Foránea - Obligatorio)
  @IsNotEmpty({ message: 'El ID de la empresa es obligatorio.' })
  @IsNumber({}, { message: 'El ID de la empresa debe ser un número entero.' })
  @Type(() => Number) // Asegura que el valor sea tratado como número
  readonly id_empresa: number;

  // NOMBRE (Obligatorio)
  @IsNotEmpty({ message: 'El nombre de la sucursal no puede estar vacío.' })
  @IsString({ message: 'El nombre debe ser texto.' })
  @MaxLength(150, { message: 'El nombre debe tener menos de 150 caracteres.' })
  readonly nombre: string;

  // TELÉFONO (Opcional - Nullable en DB)
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto.' })
  @MaxLength(25, { message: 'El teléfono debe tener menos de 25 caracteres.' })
  @Transform(({ value }) => (value === undefined ? null : value))
  readonly telefono?: string | null;

  // DIRECCIÓN (Opcional - Nullable en DB)
  @IsOptional()
  @IsString({ message: 'La dirección debe ser texto.' })
  @MaxLength(500, {
    message: 'La dirección debe tener menos de 500 caracteres.',
  })
  @Transform(({ value }) => (value === undefined ? null : value))
  readonly direccion?: string | null;

  // CORREO (Opcional - Nullable en DB)
  @IsOptional()
  @IsEmail({}, { message: 'El formato del correo es inválido.' })
  @MaxLength(250, { message: 'El correo debe tener menos de 250 caracteres.' })
  @Transform(({ value }) => (value === undefined ? null : value))
  readonly correo?: string | null;

  // ESTADO (Opcional, default: true)
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano.' })
  readonly estado?: boolean;

  // CASA_CENTRAL (Obligatorio - Solo S o N)
  @IsNotEmpty({ message: 'El indicador de Casa Central es obligatorio.' })
  @IsString({ message: 'Casa Central debe ser texto.' })
  @Length(1, 1, { message: 'Casa Central debe ser un solo carácter (S o N).' })
  @IsIn(['S', 'N'], {
    message: 'Casa Central solo puede ser "S" (Sí) o "N" (No).',
  })
  readonly casa_central: string;
}
