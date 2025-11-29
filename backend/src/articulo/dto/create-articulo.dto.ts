import { IsBoolean, IsDecimal, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateArticuloDto {
    @IsString()
    @IsOptional()
    @MaxLength(100)
    codigo_alfanumerico?: string;

    @IsString()
    @IsOptional()
    @MaxLength(200)
    referencia?: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(250)
    nombre: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    descripcion?: string;

    @IsInt()
    @IsOptional()
    id_linea?: number;

    @IsInt()
    @IsOptional()
    id_tipo_articulo?: number;

    @IsInt()
    @IsOptional()
    id_marca?: number;

    @IsInt()
    @IsNotEmpty()
    id_unidad_medida: number;

    @IsInt()
    @IsOptional()
    id_impuesto?: number;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;

    @IsInt()
    @IsOptional()
    usuario_creacion?: number;

    @IsInt()
    @IsOptional()
    usuario_actualizacion?: number;
}
