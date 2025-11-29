import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class CreateClienteDto {
    @IsNumber()
    @IsNotEmpty()
    id_ciudad: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(250)
    nombre: string;

    @IsBoolean()
    @IsOptional()
    es_contribuyente?: boolean;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    @ValidateIf(o => o.es_contribuyente === true)
    ruc?: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    @ValidateIf(o => o.es_contribuyente === false)
    ci?: string;

    @IsString()
    @IsOptional()
    @MaxLength(2)
    dv?: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    telefono?: string;

    @IsString()
    @IsOptional()
    @MaxLength(200)
    direccion?: string;

    @IsEmail()
    @IsOptional()
    @MaxLength(250)
    email?: string;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;
}
