import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProveedorDto {
    @IsNumber()
    @IsNotEmpty()
    id_ciudad: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(250)
    razon_social: string;

    @IsBoolean()
    @IsOptional()
    es_contribuyente?: boolean;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    ruc: string;

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

    @IsString()
    @IsOptional()
    @MaxLength(150)
    representante_nombre?: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    representante_telefono?: string;

    @IsEmail()
    @IsOptional()
    @MaxLength(100)
    representante_email?: string;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;
}
