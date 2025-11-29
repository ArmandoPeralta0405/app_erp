import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Departamento } from './departamento.service';

export interface Ciudad {
    id_ciudad: number;
    id_departamento: number;
    nombre: string;
    estado?: boolean;
    departamento?: Departamento;
}

export interface CreateCiudadDto {
    id_departamento: number;
    nombre: string;
    estado?: boolean;
}

export interface UpdateCiudadDto {
    id_departamento?: number;
    nombre?: string;
    estado?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CiudadService {
    private apiUrl = `${environment.apiUrl}/ciudad`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Ciudad[]> {
        return this.http.get<Ciudad[]>(this.apiUrl);
    }

    getById(id: number): Observable<Ciudad> {
        return this.http.get<Ciudad>(`${this.apiUrl}/${id}`);
    }

    create(ciudad: CreateCiudadDto): Observable<Ciudad> {
        return this.http.post<Ciudad>(this.apiUrl, ciudad);
    }

    update(id: number, ciudad: UpdateCiudadDto): Observable<Ciudad> {
        return this.http.patch<Ciudad>(`${this.apiUrl}/${id}`, ciudad);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
