import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TipoTransaccion } from './tipo-transaccion.service';

export interface ConfiguracionSistema {
    id_configuracion_sistema: number;
    id_tipo_transaccion_ajuste_positivo?: number;
    id_tipo_transaccion_ajuste_negativo?: number;
    id_tipo_transaccion_factura_contado_emitida?: number;
    id_tipo_transaccion_factura_contado_recibida?: number;
    id_tipo_transaccion_factura_credito_emitida?: number;
    id_tipo_transaccion_factura_credito_recibida?: number;
    id_tipo_transaccion_nota_credito_emitida?: number;
    id_tipo_transaccion_nota_credito_recibida?: number;
    id_tipo_transaccion_remision_emitida?: number;
    id_tipo_transaccion_remision_recibida?: number;
    estado: boolean;

    // Relaciones (nombres largos generados por Prisma, los mapeamos o usamos directos)
    tipo_transaccion_configuracion_sistema_id_tipo_transaccion_ajuste_positivoTotipo_transaccion?: TipoTransaccion;
    tipo_transaccion_configuracion_sistema_id_tipo_transaccion_ajuste_negativoTotipo_transaccion?: TipoTransaccion;
    tipo_transaccion_configuracion_sistema_id_tipo_transaccion_factura_contado_emitidaTotipo_transaccion?: TipoTransaccion;
    tipo_transaccion_configuracion_sistema_id_tipo_transaccion_factura_contado_recibidaTotipo_transaccion?: TipoTransaccion;
    tipo_transaccion_configuracion_sistema_id_tipo_transaccion_nota_credito_emitidaTotipo_transaccion?: TipoTransaccion;
    tipo_transaccion_configuracion_sistema_id_tipo_transaccion_nota_credito_recibidaTotipo_transaccion?: TipoTransaccion;
    tipo_transaccion_configuracion_sistema_id_tipo_transaccion_remision_emitidaTotipo_transaccion?: TipoTransaccion;
    tipo_transaccion_configuracion_sistema_id_tipo_transaccion_remision_recibidaTotipo_transaccion?: TipoTransaccion;
}

export interface CreateConfiguracionSistemaDto {
    id_tipo_transaccion_ajuste_positivo?: number;
    id_tipo_transaccion_ajuste_negativo?: number;
    id_tipo_transaccion_factura_contado_emitida?: number;
    id_tipo_transaccion_factura_contado_recibida?: number;
    id_tipo_transaccion_factura_credito_emitida?: number;
    id_tipo_transaccion_factura_credito_recibida?: number;
    id_tipo_transaccion_nota_credito_emitida?: number;
    id_tipo_transaccion_nota_credito_recibida?: number;
    id_tipo_transaccion_remision_emitida?: number;
    id_tipo_transaccion_remision_recibida?: number;
    estado?: boolean;
}

export interface UpdateConfiguracionSistemaDto extends Partial<CreateConfiguracionSistemaDto> { }

@Injectable({
    providedIn: 'root'
})
export class ConfiguracionSistemaService {
    private apiUrl = `${environment.apiUrl}/configuracion-sistema`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<ConfiguracionSistema[]> {
        return this.http.get<ConfiguracionSistema[]>(this.apiUrl);
    }

    getById(id: number): Observable<ConfiguracionSistema> {
        return this.http.get<ConfiguracionSistema>(`${this.apiUrl}/${id}`);
    }

    create(dto: CreateConfiguracionSistemaDto): Observable<ConfiguracionSistema> {
        return this.http.post<ConfiguracionSistema>(this.apiUrl, dto);
    }

    update(id: number, dto: UpdateConfiguracionSistemaDto): Observable<ConfiguracionSistema> {
        return this.http.patch<ConfiguracionSistema>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
