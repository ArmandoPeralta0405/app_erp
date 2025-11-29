import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMotivoAjusteInventarioDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nombre: string;

    @IsString()
    @IsOptional()
    @MaxLength(250)
    descripcion?: string;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;
}
