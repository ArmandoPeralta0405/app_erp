// src/empresa/dto/create_empresa.dto.ts (Corregido para Prisma/Null)

import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer'; // 💡 NUEVA IMPORTACIÓN

export class CreateEmpresaDto {
  // RAZÓN SOCIAL (Obligatorio)
  @IsNotEmpty({ message: 'La razón social no puede estar vacía.' })
  @IsString({ message: 'La razón social debe ser texto.' })
  @MaxLength(250, {
    message: 'La razón social debe tener menos de 250 caracteres.',
  })
  readonly razon_social: string;

  // RUC (Obligatorio)
  @IsNotEmpty({ message: 'El RUC no puede estar vacío.' })
  @IsString({ message: 'El RUC debe ser texto.' })
  @MaxLength(15, { message: 'El RUC debe tener menos de 15 caracteres.' })
  readonly ruc: string;

  // DV (Dígito Verificador - Obligatorio)
  @IsNotEmpty({ message: 'El DV no puede estar vacío.' })
  @IsString({ message: 'El DV debe ser texto.' })
  @Length(1, 2, { message: 'El DV debe tener 1 o 2 caracteres.' })
  readonly dv: string;

  // TELÉFONO (Opcional - Nullable)
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto.' })
  @MaxLength(25, { message: 'El teléfono debe tener menos de 25 caracteres.' })
  @Transform(({ value }) => (value === undefined ? null : value)) // 💡 CONVERSIÓN DE UNDEFINED A NULL
  readonly telefono?: string | null;

  // DIRECCIÓN (Opcional - Nullable)
  @IsOptional()
  @IsString({ message: 'La dirección debe ser texto.' })
  @MaxLength(500, {
    message: 'La dirección debe tener menos de 500 caracteres.',
  })
  @Transform(({ value }) => (value === undefined ? null : value)) // 💡 CONVERSIÓN DE UNDEFINED A NULL
  readonly direccion?: string | null;

  // CORREO (Opcional, debe ser un formato de email válido - Nullable)
  @IsOptional()
  @IsEmail({}, { message: 'El formato del correo es inválido.' })
  @MaxLength(250, { message: 'El correo debe tener menos de 250 caracteres.' })
  @Transform(({ value }) => (value === undefined ? null : value)) // 💡 CONVERSIÓN DE UNDEFINED A NULL
  readonly correo?: string | null;

  // ESTADO (Opcional, valor por defecto: true)
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano.' })
  readonly estado?: boolean;
}
