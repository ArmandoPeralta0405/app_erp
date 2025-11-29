import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMarcaDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nombre: string;
}
