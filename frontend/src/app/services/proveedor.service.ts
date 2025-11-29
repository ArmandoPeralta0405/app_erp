import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ciudad } from './ciudad.service';

export interface Proveedor {
    id_proveedor: number;
    id_ciudad: number;
    razon_social: string;
    es_contribuyente?: boolean;
    ruc: string;
    dv?: string;
    telefono?: string;
    direccion?: string;
    email?: string;
    representante_nombre?: string;
    representante_telefono?: string;
    representante_email?: string;
    estado?: boolean;
    ciudad?: Ciudad;
}

export interface CreateProveedorDto {
    id_ciudad: number;
    razon_social: string;
    es_contribuyente?: boolean;
    ruc: string;
    dv?: string;
    telefono?: string;
    direccion?: string;
    email?: string;
    representante_nombre?: string;
    representante_telefono?: string;
    representante_email?: string;
    estado?: boolean;
}

export interface UpdateProveedorDto {
    id_ciudad?: number;
    razon_social?: string;
    es_contribuyente?: boolean;
    ruc?: string;
    dv?: string;
    telefono?: string;
    direccion?: string;
    email?: string;
    representante_nombre?: string;
    representante_telefono?: string;
    representante_email?: string;
    estado?: boolean;
}

export interface CalcularDVResponse {
    ruc: string;
    dv: number;
    ruc_completo: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProveedorService {
    private apiUrl = `${environment.apiUrl}/proveedor`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Proveedor[]> {
        return this.http.get<Proveedor[]>(this.apiUrl);
    }

    getById(id: number): Observable<Proveedor> {
        return this.http.get<Proveedor>(`${this.apiUrl}/${id}`);
    }

    create(proveedor: CreateProveedorDto): Observable<Proveedor> {
        return this.http.post<Proveedor>(this.apiUrl, proveedor);
    }

    update(id: number, proveedor: UpdateProveedorDto): Observable<Proveedor> {
        return this.http.patch<Proveedor>(`${this.apiUrl}/${id}`, proveedor);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Calcular dígito verificador del RUC
    calcularDV(ruc: string): Observable<CalcularDVResponse> {
        // Usando el endpoint de empresa ya que el cálculo es el mismo
        return this.http.get<CalcularDVResponse>(`${environment.apiUrl}/empresa/calcular-dv`, {
            params: { ruc }
        });
    }
}
