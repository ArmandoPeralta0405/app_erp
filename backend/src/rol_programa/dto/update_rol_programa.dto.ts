// src/rol_programa/dto/update_rol_programa.dto.ts

import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateRolProgramaDto {
  // ACCESO_LECTURA (Opcional)
  @IsOptional()
  @IsBoolean({ message: 'El acceso de lectura debe ser un valor booleano.' })
  readonly acceso_lectura?: boolean;

  // ACCESO_ESCRITURA (Opcional)
  @IsOptional()
  @IsBoolean({ message: 'El acceso de escritura debe ser un valor booleano.' })
  readonly acceso_escritura?: boolean;

  // ACCESO_ELIMINACION (Opcional)
  @IsOptional()
  @IsBoolean({
    message: 'El acceso de eliminación debe ser un valor booleano.',
  })
  readonly acceso_eliminacion?: boolean;
}
