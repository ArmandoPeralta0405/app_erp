import { IsInt, IsOptional, IsString, IsNumber, IsDateString, IsArray, ValidateNested, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

// DTO para el detalle del movimiento
export class MovimientoStockDetalleDto {
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
    porcentaje_iva?: number;

    @IsNumber()
    @IsOptional()
    porcentaje_descuento?: number;

    @IsNumber()
    @IsOptional()
    descuento_ml?: number;

    @IsNumber()
    @IsOptional()
    descuento_me?: number;

    @IsNumber()
    @IsOptional()
    importe_ml?: number;

    @IsNumber()
    @IsOptional()
    importe_me?: number;
}

// DTO para crear movimiento de stock (cabecera + detalle)
export class CreateMovimientoStockDto {
    @IsInt()
    @IsNotEmpty()
    id_tipo_transaccion: number;

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
    @IsOptional()
    id_cliente?: number;

    @IsInt()
    @IsOptional()
    id_proveedor?: number;

    @IsInt()
    @IsOptional()
    id_motivo_ajuste?: number;

    @IsInt()
    @IsOptional()
    id_movimiento_stock_padre?: number;

    @IsNotEmpty()
    numero_comprobante: number;

    @IsOptional()
    numero_timbrado?: number;

    @IsDateString()
    @IsNotEmpty()
    fecha_documento: string;

    @IsNumber()
    @IsOptional()
    tasa_cambio?: number;

    @IsNumber()
    @IsOptional()
    total_ml?: number;

    @IsNumber()
    @IsOptional()
    total_me?: number;

    @IsString()
    @IsOptional()
    observacion?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MovimientoStockDetalleDto)
    @IsNotEmpty()
    detalle: MovimientoStockDetalleDto[];
}

// DTO para actualizar movimiento (sin detalle, el detalle se maneja aparte)
export class UpdateMovimientoStockDto {
    @IsInt()
    @IsOptional()
    id_tipo_transaccion?: number;

    @IsInt()
    @IsOptional()
    id_sucursal?: number;

    @IsInt()
    @IsOptional()
    id_deposito?: number;

    @IsInt()
    @IsOptional()
    id_moneda?: number;

    @IsInt()
    @IsOptional()
    id_cliente?: number;

    @IsInt()
    @IsOptional()
    id_proveedor?: number;

    @IsInt()
    @IsOptional()
    id_motivo_ajuste?: number;

    @IsOptional()
    numero_timbrado?: number;

    @IsDateString()
    @IsOptional()
    fecha_documento?: string;

    @IsNumber()
    @IsOptional()
    tasa_cambio?: number;

    @IsNumber()
    @IsOptional()
    total_ml?: number;

    @IsNumber()
    @IsOptional()
    total_me?: number;

    @IsString()
    @IsOptional()
    observacion?: string;
}
