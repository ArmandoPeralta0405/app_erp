import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class CreateConfiguracionSistemaDto {
    @IsInt()
    @IsOptional()
    id_tipo_transaccion_ajuste_positivo?: number;

    @IsInt()
    @IsOptional()
    id_tipo_transaccion_ajuste_negativo?: number;

    @IsInt()
    @IsOptional()
    id_tipo_transaccion_factura_contado_emitida?: number;

    @IsInt()
    @IsOptional()
    id_tipo_transaccion_factura_contado_recibida?: number;

    @IsInt()
    @IsOptional()
    id_tipo_transaccion_factura_credito_emitida?: number;

    @IsInt()
    @IsOptional()
    id_tipo_transaccion_factura_credito_recibida?: number;

    @IsInt()
    @IsOptional()
    id_tipo_transaccion_nota_credito_emitida?: number;

    @IsInt()
    @IsOptional()
    id_tipo_transaccion_nota_credito_recibida?: number;

    @IsInt()
    @IsOptional()
    id_tipo_transaccion_remision_emitida?: number;

    @IsInt()
    @IsOptional()
    id_tipo_transaccion_remision_recibida?: number;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;
}
