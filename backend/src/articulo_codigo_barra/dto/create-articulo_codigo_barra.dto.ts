import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateArticuloCodigoBarraDto {
    @IsInt()
    @IsNotEmpty()
    id_articulo: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    codigo_barra: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    tipo_codigo_barra?: string;

    @IsInt()
    @IsNotEmpty()
    id_unidad_medida: number;

    @IsBoolean()
    @IsOptional()
    es_principal?: boolean;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;
}
