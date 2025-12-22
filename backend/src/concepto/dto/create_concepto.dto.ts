import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateConceptoDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    descripcion: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1)
    @IsIn(['D', 'C'], { message: 'El tipo de concepto debe ser D (Débito) o C (Crédito)' })
    tipo_concepto: string;

    @IsInt()
    @IsOptional()
    id_cuenta_contable?: number;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;
}
