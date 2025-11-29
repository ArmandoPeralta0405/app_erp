import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateImpuestoDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nombre: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    abreviacion: string;

    @IsNumber()
    @IsNotEmpty()
    valor_calculo: number;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;
}
