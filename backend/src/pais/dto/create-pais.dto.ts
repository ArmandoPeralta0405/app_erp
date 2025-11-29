import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePaisDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nombre: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(3)
    codigo_iso: string;

    @IsString()
    @IsOptional()
    @MaxLength(2)
    codigo_iso2?: string;

    @IsString()
    @IsOptional()
    @MaxLength(5)
    codigo_telefono?: string;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;
}
