import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Moneda {
    id_moneda: number;
    nombre: string;
    simbolo: string;
    cantidad_decimal?: number;
    estado?: boolean;
}

export interface Cotizacion {
    id_moneda: number;
    fecha: string; // formato: YYYY-MM-DD
    tasa_compra: number;
    tasa_venta: number;
    moneda?: Moneda;
}

export interface CreateCotizacionDto {
    id_moneda: number;
    fecha: string;
    tasa_compra: number;
    tasa_venta: number;
}

export interface UpdateCotizacionDto {
    tasa_compra?: number;
    tasa_venta?: number;
}

@Injectable({
    providedIn: 'root'
})
export class CotizacionService {
    private apiUrl = `${environment.apiUrl}/cotizacion`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Cotizacion[]> {
        return this.http.get<Cotizacion[]>(this.apiUrl);
    }

    getById(id_moneda: number, fecha: string): Observable<Cotizacion> {
        return this.http.get<Cotizacion>(`${this.apiUrl}/${id_moneda}/${fecha}`);
    }

    getByMoneda(id_moneda: number): Observable<Cotizacion[]> {
        return this.http.get<Cotizacion[]>(`${this.apiUrl}/moneda/${id_moneda}`);
    }

    getByFecha(fecha: string): Observable<Cotizacion[]> {
        return this.http.get<Cotizacion[]>(`${this.apiUrl}/fecha/${fecha}`);
    }

    create(cotizacion: CreateCotizacionDto): Observable<Cotizacion> {
        return this.http.post<Cotizacion>(this.apiUrl, cotizacion);
    }

    update(id_moneda: number, fecha: string, cotizacion: UpdateCotizacionDto): Observable<Cotizacion> {
        return this.http.patch<Cotizacion>(`${this.apiUrl}/${id_moneda}/${fecha}`, cotizacion);
    }

    delete(id_moneda: number, fecha: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id_moneda}/${fecha}`);
    }
}
