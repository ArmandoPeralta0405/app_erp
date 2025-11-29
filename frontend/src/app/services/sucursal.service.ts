import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Sucursal {
    id_sucursal: number;
    id_empresa: number;
    nombre: string;
    casa_central: string; // 'S' o 'N'
    telefono: string | null;
    direccion: string | null;
    correo: string | null;
    estado: boolean;
    empresa?: {
        id_empresa: number;
        razon_social: string;
        ruc: string;
        dv: string;
    };
}

export interface CreateSucursalDto {
    id_empresa: number;
    nombre: string;
    casa_central: string;
    telefono?: string;
    direccion?: string;
    correo?: string;
    estado?: boolean;
}

export interface UpdateSucursalDto {
    nombre?: string;
    casa_central?: string;
    telefono?: string;
    direccion?: string;
    correo?: string;
    estado?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class SucursalService {
    private apiUrl = `${environment.apiUrl}/sucursal`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Sucursal[]> {
        return this.http.get<Sucursal[]>(this.apiUrl);
    }

    getOne(id: number): Observable<Sucursal> {
        return this.http.get<Sucursal>(`${this.apiUrl}/${id}`);
    }

    create(data: CreateSucursalDto): Observable<Sucursal> {
        return this.http.post<Sucursal>(this.apiUrl, data);
    }

    update(id: number, data: UpdateSucursalDto): Observable<Sucursal> {
        return this.http.patch<Sucursal>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: number): Observable<Sucursal> {
        return this.http.delete<Sucursal>(`${this.apiUrl}/${id}`);
    }
}
