import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCuentaContableDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    numero_cuenta: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(250)
    descripcion: string;

    @IsInt()
    @IsNotEmpty()
    @Min(1)
    nivel: number;

    @IsInt()
    @IsNotEmpty()
    id_grupo_cuenta_contable: number;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;
}
