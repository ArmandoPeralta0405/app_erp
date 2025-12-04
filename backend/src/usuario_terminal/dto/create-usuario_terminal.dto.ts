import { IsInt, IsArray, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUsuarioTerminalDto {
    @IsInt()
    @Type(() => Number)
    id_usuario: number;

    @IsInt()
    @Type(() => Number)
    id_terminal: number;
}

export class AssignUsuariosToTerminalDto {
    @IsInt()
    @Type(() => Number)
    id_terminal: number;

    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    @Type(() => Number)
    id_usuarios: number[];
}

export class AssignTerminalesToUsuarioDto {
    @IsInt()
    @Type(() => Number)
    id_usuario: number;

    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    @Type(() => Number)
    id_terminales: number[];
}
