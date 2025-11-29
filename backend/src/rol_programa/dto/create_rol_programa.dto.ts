// src/rol_programa/dto/create_rol_programa.dto.ts

import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRolProgramaDto {
  // ID_ROL (Clave Compuesta/Foránea - Obligatorio)
  @IsNotEmpty({ message: 'El ID del rol es obligatorio.' })
  @IsNumber({}, { message: 'El ID del rol debe ser un número entero.' })
  @Type(() => Number)
  readonly id_rol: number;

  // ID_PROGRAMA (Clave Compuesta/Foránea - Obligatorio)
  @IsNotEmpty({ message: 'El ID del programa es obligatorio.' })
  @IsNumber({}, { message: 'El ID del programa debe ser un número entero.' })
  @Type(() => Number)
  readonly id_programa: number;

  // ACCESO_LECTURA (Opcional, default: false)
  @IsOptional()
  @IsBoolean({ message: 'El acceso de lectura debe ser un valor booleano.' })
  readonly acceso_lectura?: boolean;

  // ACCESO_ESCRITURA (Opcional, default: false)
  @IsOptional()
  @IsBoolean({ message: 'El acceso de escritura debe ser un valor booleano.' })
  readonly acceso_escritura?: boolean;

  // ACCESO_ELIMINACION (Opcional, default: false)
  @IsOptional()
  @IsBoolean({
    message: 'El acceso de eliminación debe ser un valor booleano.',
  })
  readonly acceso_eliminacion?: boolean;
}
