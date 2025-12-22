import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGrupoCuentaContableDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nombre: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    codigo: string;

    @IsString()
    @IsOptional()
    @MaxLength(250)
    descripcion?: string;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;
}
