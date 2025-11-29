import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCiudadDto {
    @IsNumber()
    @IsNotEmpty()
    id_departamento: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nombre: string;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;
}
