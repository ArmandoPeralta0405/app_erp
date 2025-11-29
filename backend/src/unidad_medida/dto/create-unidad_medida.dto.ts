import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUnidadMedidaDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nombre: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    simbolo: string;

    @IsNumber()
    @IsNotEmpty()
    factor_conversion: number;

    @IsString()
    @IsOptional()
    @MaxLength(10)
    codigo_iso?: string;

    @IsBoolean()
    @IsOptional()
    es_base?: boolean;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;
}
