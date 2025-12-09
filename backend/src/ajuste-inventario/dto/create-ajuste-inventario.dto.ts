import { IsInt, IsOptional, IsString, IsNumber, IsDateString, IsArray, ValidateNested, IsNotEmpty, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class DetalleAjusteInventarioDto {
    @IsInt()
    @IsNotEmpty()
    id_articulo: number;

    @IsInt()
    @IsNotEmpty()
    @Min(1)
    numero_item: number;

    @IsNumber()
    @IsNotEmpty()
    cantidad: number;

    @IsNumber()
    @IsOptional()
    costo_ml?: number;

    @IsNumber()
    @IsOptional()
    costo_me?: number;

    @IsNumber()
    @IsOptional()
    precio_ml?: number;

    @IsNumber()
    @IsOptional()
    precio_me?: number;

    @IsNumber()
    @IsOptional()
    importe_ml?: number;

    @IsNumber()
    @IsOptional()
    importe_me?: number;
}

export class CreateAjusteInventarioDto {
    @IsInt()
    @IsNotEmpty()
    id_sucursal: number;

    @IsInt()
    @IsNotEmpty()
    id_deposito: number;

    @IsInt()
    @IsNotEmpty()
    id_usuario: number;

    @IsInt()
    @IsNotEmpty()
    id_moneda: number;

    @IsInt()
    @IsNotEmpty()
    id_motivo_ajuste: number;

    @IsNumber()
    @IsNotEmpty()
    numero_comprobante: number;

    @IsDateString()
    @IsNotEmpty()
    fecha_documento: string;

    @IsNumber()
    @IsOptional()
    tasa_cambio?: number;

    @IsString()
    @IsOptional()
    observacion?: string;

    @IsEnum(['POSITIVO', 'NEGATIVO'])
    @IsNotEmpty()
    tipo_ajuste: 'POSITIVO' | 'NEGATIVO';

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetalleAjusteInventarioDto)
    @IsNotEmpty()
    detalle: DetalleAjusteInventarioDto[];
}
