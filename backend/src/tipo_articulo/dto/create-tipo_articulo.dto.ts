import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTipo_articuloDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nombre: string;
}
