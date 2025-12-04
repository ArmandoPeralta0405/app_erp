import { IsString, IsInt, IsBoolean, IsOptional, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTerminalDto {
    @IsString()
    @MaxLength(150)
    nombre: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    limite_items?: number;

    @IsOptional()
    @IsString()
    @MaxLength(250)
    observacion?: string;

    @IsOptional()
    @Type(() => Number)
    ultimo_numero_factura?: number;

    @IsOptional()
    @Type(() => Number)
    ultimo_numero_nota_credito?: number;

    @IsOptional()
    @Type(() => Number)
    ultimo_numero_remision?: number;

    @IsOptional()
    @IsBoolean()
    estado?: boolean;
}
