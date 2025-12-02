import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateClaseDocumentoDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nombre: string;
}
