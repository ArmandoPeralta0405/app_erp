import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateUsuarioRolDto {
  // ID_USUARIO (Obligatorio)
  @IsNotEmpty({ message: 'El ID de usuario es obligatorio.' })
  @IsInt({ message: 'El ID de usuario debe ser un número entero.' })
  @Min(1, { message: 'El ID de usuario debe ser un valor positivo.' })
  readonly id_usuario: number;

  // ID_ROL (Obligatorio)
  @IsNotEmpty({ message: 'El ID de rol es obligatorio.' })
  @IsInt({ message: 'El ID de rol debe ser un número entero.' })
  @Min(1, { message: 'El ID de rol debe ser un valor positivo.' })
  readonly id_rol: number;
}
