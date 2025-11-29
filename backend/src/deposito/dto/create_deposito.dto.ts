import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDepositoDto {
  // ID_SUCURSAL (Clave Foránea - Obligatorio)
  @IsNotEmpty({ message: 'El ID de la sucursal es obligatorio.' })
  @IsNumber({}, { message: 'El ID de la sucursal debe ser un número entero.' })
  @Type(() => Number)
  readonly id_sucursal: number;

  // NOMBRE (Obligatorio)
  @IsNotEmpty({ message: 'El nombre del depósito no puede estar vacío.' })
  @IsString({ message: 'El nombre debe ser texto.' })
  @MaxLength(150, { message: 'El nombre debe tener menos de 150 caracteres.' })
  readonly nombre: string;

  // ESTADO (Opcional, default: true)
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano.' })
  readonly estado?: boolean;
}
