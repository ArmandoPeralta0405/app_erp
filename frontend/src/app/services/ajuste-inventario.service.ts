import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DetalleAjusteInventario {
    id_articulo: number;
    numero_item: number;
    cantidad: number;
    costo_ml?: number;
    costo_me?: number;
    precio_ml?: number;
    precio_me?: number;
    importe_ml?: number;
    importe_me?: number;
    porcentaje_iva?: number;
    articulo?: {
        id_articulo: number;
        codigo_alfanumerico: string;
        nombre: string;
    };
}

export interface CreateAjusteInventarioDto {
    id_sucursal: number;
    id_deposito: number;
    id_usuario: number;
    id_moneda: number;
    id_motivo_ajuste: number;
    numero_comprobante: number;
    fecha_documento: string;
    tasa_cambio?: number;
    observacion?: string;
    tipo_ajuste: 'POSITIVO' | 'NEGATIVO';
    detalle: DetalleAjusteInventario[];
}

export interface AjusteInventario {
    id_movimiento_stock: number;
    id_tipo_transaccion: number;
    id_sucursal: number;
    id_deposito: number;
    id_usuario: number;
    id_moneda: number;
    id_motivo_ajuste?: number;
    numero_comprobante: number;
    fecha_documento: string;
    fecha_grabacion: string;
    tasa_cambio: number;
    total_ml: number;
    total_me?: number;
    observacion?: string;
    sucursal?: any;
    deposito?: any;
    usuario?: any;
    moneda?: any;
    motivo_ajuste_inventario?: any;
    tipo_transaccion?: {
        id_tipo_transaccion: number;
        nombre: string;
        tipo: string;
    };
    movimiento_stock_detalle?: DetalleAjusteInventario[];
}

@Injectable({
    providedIn: 'root'
})
export class AjusteInventarioService {
    private apiUrl = `${environment.apiUrl}/ajuste-inventario`;

    constructor(private http: HttpClient) { }

    getAll(filters?: any): Observable<AjusteInventario[]> {
        let params = new HttpParams();
        if (filters) {
            Object.keys(filters).forEach(key => {
                if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                    params = params.append(key, filters[key]);
                }
            });
        }
        return this.http.get<AjusteInventario[]>(this.apiUrl, { params });
    }

    getOne(id: number): Observable<AjusteInventario> {
        return this.http.get<AjusteInventario>(`${this.apiUrl}/${id}`);
    }

    create(data: CreateAjusteInventarioDto): Observable<AjusteInventario> {
        return this.http.post<AjusteInventario>(this.apiUrl, data);
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    checkConfig(id_usuario: number): Observable<{ hasConfig: boolean, hasTerminal: boolean, positivo: boolean, negativo: boolean }> {
        return this.http.get<{ hasConfig: boolean, hasTerminal: boolean, positivo: boolean, negativo: boolean }>(`${this.apiUrl}/check-config/${id_usuario}`);
    }

    getNextNumber(id_usuario: number): Observable<{ numero: number }> {
        return this.http.get<{ numero: number }>(`${this.apiUrl}/next-number/${id_usuario}`);
    }
}
