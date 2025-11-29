// src/programa/dto/create_programa.dto.ts

import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProgramaDto {
  // ID_MODULO (Clave Foránea - Obligatorio)
  @IsNotEmpty({ message: 'El ID del módulo es obligatorio.' })
  @IsNumber({}, { message: 'El ID del módulo debe ser un número entero.' })
  @Type(() => Number)
  readonly id_modulo: number;

  // ID_CATEGORIA_PROGRAMA (Clave Foránea - Obligatorio)
  @IsNotEmpty({
    message: 'El ID de la categoría del programa es obligatorio.',
  })
  @IsNumber(
    {},
    {
      message: 'El ID de la categoría del programa debe ser un número entero.',
    },
  )
  @Type(() => Number)
  readonly id_categoria_programa: number;

  // TITULO (Obligatorio, max 150)
  @IsNotEmpty({ message: 'El título del programa no puede estar vacío.' })
  @IsString({ message: 'El título debe ser texto.' })
  @MaxLength(150, { message: 'El título debe tener menos de 150 caracteres.' })
  readonly titulo: string;

  // CODIGO_ALFANUMERICO (Obligatorio, Único, max 50)
  @IsNotEmpty({
    message: 'El código alfanumérico no puede estar vacío.',
  })
  @IsString({ message: 'El código alfanumérico debe ser texto.' })
  @MaxLength(50, {
    message: 'El código debe tener menos de 50 caracteres.',
  })
  readonly codigo_alfanumerico: string;

  // RUTA_ACCESO (Obligatorio, max 250)
  @IsNotEmpty({ message: 'La ruta de acceso es obligatoria.' })
  @IsString({ message: 'La ruta de acceso debe ser texto.' })
  @MaxLength(250, {
    message: 'La ruta de acceso debe tener menos de 250 caracteres.',
  })
  readonly ruta_acceso: string;

  // ESTADO (Opcional, default: true)
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano.' })
  readonly estado?: boolean;
}
