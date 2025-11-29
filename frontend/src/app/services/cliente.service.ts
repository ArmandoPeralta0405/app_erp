import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ciudad } from './ciudad.service';

export interface Cliente {
    id_cliente: number;
    id_ciudad: number;
    nombre: string;
    es_contribuyente?: boolean;
    ruc?: string;
    ci?: string;
    dv?: string;
    telefono?: string;
    direccion?: string;
    email?: string;
    estado?: boolean;
    ciudad?: Ciudad;
}

export interface CreateClienteDto {
    id_ciudad: number;
    nombre: string;
    es_contribuyente?: boolean;
    ruc?: string;
    ci?: string;
    dv?: string;
    telefono?: string;
    direccion?: string;
    email?: string;
    estado?: boolean;
}

export interface UpdateClienteDto {
    id_ciudad?: number;
    nombre?: string;
    es_contribuyente?: boolean;
    ruc?: string;
    ci?: string;
    dv?: string;
    telefono?: string;
    direccion?: string;
    email?: string;
    estado?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ClienteService {
    private apiUrl = `${environment.apiUrl}/cliente`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Cliente[]> {
        return this.http.get<Cliente[]>(this.apiUrl);
    }

    getById(id: number): Observable<Cliente> {
        return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
    }

    create(cliente: CreateClienteDto): Observable<Cliente> {
        return this.http.post<Cliente>(this.apiUrl, cliente);
    }

    update(id: number, cliente: UpdateClienteDto): Observable<Cliente> {
        return this.http.patch<Cliente>(`${this.apiUrl}/${id}`, cliente);
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

export interface CalcularDVResponse {
    ruc: string;
    dv: number;
    ruc_completo: string;
}
