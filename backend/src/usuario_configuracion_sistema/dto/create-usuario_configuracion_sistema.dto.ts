import { IsInt } from 'class-validator';

export class CreateUsuarioConfiguracionSistemaDto {
    @IsInt()
    id_usuario: number;

    @IsInt()
    id_configuracion_sistema: number;
}
