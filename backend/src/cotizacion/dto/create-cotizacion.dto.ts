import { IsInt, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCotizacionDto {
    @IsInt()
    id_moneda: number;

    @IsDateString()
    fecha: string; // formato: YYYY-MM-DD

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    tasa_compra: number;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    tasa_venta: number;
}
