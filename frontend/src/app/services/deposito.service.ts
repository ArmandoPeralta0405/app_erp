import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Deposito {
    id_deposito: number;
    id_sucursal: number;
    nombre: string;
    estado: boolean;
    sucursal?: {
        id_sucursal: number;
        id_empresa: number;
        nombre: string;
        empresa?: {
            id_empresa: number;
            razon_social: string;
            ruc: string;
            dv: string;
        };
    };
}

export interface CreateDepositoDto {
    id_sucursal: number;
    nombre: string;
    estado?: boolean;
}

export interface UpdateDepositoDto {
    id_sucursal?: number;
    nombre?: string;
    estado?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class DepositoService {
    private apiUrl = `${environment.apiUrl}/deposito`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Deposito[]> {
        return this.http.get<Deposito[]>(this.apiUrl);
    }

    getOne(id: number): Observable<Deposito> {
        return this.http.get<Deposito>(`${this.apiUrl}/${id}`);
    }

    create(data: CreateDepositoDto): Observable<Deposito> {
        return this.http.post<Deposito>(this.apiUrl, data);
    }

    update(id: number, data: UpdateDepositoDto): Observable<Deposito> {
        return this.http.patch<Deposito>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: number): Observable<Deposito> {
        return this.http.delete<Deposito>(`${this.apiUrl}/${id}`);
    }
}
