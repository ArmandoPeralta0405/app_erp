import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GrupoCuentaContable {
    id_grupo_cuenta_contable: number;
    nombre: string;
    codigo: string;
    descripcion?: string;
    estado?: boolean;
}

export interface CreateGrupoCuentaContableDto {
    nombre: string;
    codigo: string;
    descripcion?: string;
    estado?: boolean;
}

export interface UpdateGrupoCuentaContableDto {
    nombre?: string;
    codigo?: string;
    descripcion?: string;
    estado?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class GrupoCuentaContableService {
    private apiUrl = `${environment.apiUrl}/grupo-cuenta-contable`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<GrupoCuentaContable[]> {
        return this.http.get<GrupoCuentaContable[]>(this.apiUrl);
    }

    getById(id: number): Observable<GrupoCuentaContable> {
        return this.http.get<GrupoCuentaContable>(`${this.apiUrl}/${id}`);
    }

    create(grupoCuentaContable: CreateGrupoCuentaContableDto): Observable<GrupoCuentaContable> {
        return this.http.post<GrupoCuentaContable>(this.apiUrl, grupoCuentaContable);
    }

    update(id: number, grupoCuentaContable: UpdateGrupoCuentaContableDto): Observable<GrupoCuentaContable> {
        return this.http.patch<GrupoCuentaContable>(`${this.apiUrl}/${id}`, grupoCuentaContable);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
