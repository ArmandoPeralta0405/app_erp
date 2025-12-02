import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, IsIn } from 'class-validator';

export class CreateTipoTransaccionDto {
    @IsNumber()
    @IsNotEmpty()
    id_clase_documento: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nombre: string;

    @IsString()
    @IsOptional()
    @MaxLength(10)
    abreviacion?: string;

    @IsString()
    @IsOptional()
    @MaxLength(250)
    descripcion?: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1)
    @IsIn(['C', 'D'])
    tipo: string;

    @IsBoolean()
    @IsOptional()
    maneja_iva?: boolean;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1)
    @IsIn(['E', 'R'])
    origen: string;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;
}
