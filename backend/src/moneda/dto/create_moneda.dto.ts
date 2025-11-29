// src/moneda/dto/create_moneda.dto.ts

import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMonedaDto {
  // NOMBRE (Obligatorio)
  @IsNotEmpty({ message: 'El nombre de la moneda es obligatorio.' })
  @IsString({ message: 'El nombre debe ser texto.' })
  @MaxLength(150, { message: 'El nombre debe tener menos de 150 caracteres.' })
  readonly nombre: string;

  // SÍMBOLO (Obligatorio)
  @IsNotEmpty({ message: 'El símbolo de la moneda es obligatorio.' })
  @IsString({ message: 'El símbolo debe ser texto.' })
  @MaxLength(5, { message: 'El símbolo debe tener menos de 5 caracteres.' })
  readonly simbolo: string;

  // CANTIDAD_DECIMAL (Opcional, default: 0)
  @IsOptional()
  @IsInt({ message: 'La cantidad de decimales debe ser un número entero.' })
  @Min(0, { message: 'La cantidad de decimales no puede ser negativa.' })
  @Max(6, { message: 'La cantidad de decimales no puede exceder de 6.' }) // Límite razonable
  @Type(() => Number)
  readonly cantidad_decimal?: number;

  // ESTADO (Opcional, default: true)
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano.' })
  readonly estado?: boolean;
}
