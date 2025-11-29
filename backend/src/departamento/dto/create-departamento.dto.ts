import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDepartamentoDto {
    @IsNumber()
    @IsNotEmpty()
    id_pais: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nombre: string;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;
}
