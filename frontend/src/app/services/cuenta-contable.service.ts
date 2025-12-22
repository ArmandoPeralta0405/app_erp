import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CuentaContable {
    id_cuenta_contable: number;
    numero_cuenta: string;
    descripcion: string;
    nivel: number;
    id_grupo_cuenta_contable: number;
    estado?: boolean;
    grupo_cuenta_contable?: {
        id_grupo_cuenta_contable: number;
        nombre: string;
        codigo: string;
        descripcion?: string;
        estado?: boolean;
    };
}

export interface CreateCuentaContableDto {
    numero_cuenta: string;
    descripcion: string;
    nivel: number;
    id_grupo_cuenta_contable: number;
    estado?: boolean;
}

export interface UpdateCuentaContableDto {
    numero_cuenta?: string;
    descripcion?: string;
    nivel?: number;
    id_grupo_cuenta_contable?: number;
    estado?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CuentaContableService {
    private apiUrl = `${environment.apiUrl}/cuenta-contable`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<CuentaContable[]> {
        return this.http.get<CuentaContable[]>(this.apiUrl);
    }

    getById(id: number): Observable<CuentaContable> {
        return this.http.get<CuentaContable>(`${this.apiUrl}/${id}`);
    }

    create(cuentaContable: CreateCuentaContableDto): Observable<CuentaContable> {
        return this.http.post<CuentaContable>(this.apiUrl, cuentaContable);
    }

    update(id: number, cuentaContable: UpdateCuentaContableDto): Observable<CuentaContable> {
        return this.http.patch<CuentaContable>(`${this.apiUrl}/${id}`, cuentaContable);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
