import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Modulo {
    id_modulo: number;
    nombre: string;
    descripcion: string | null;
    estado: boolean;
}

export interface CreateModuloDto {
    nombre: string;
    descripcion?: string;
    estado?: boolean;
}

export interface UpdateModuloDto {
    nombre?: string;
    descripcion?: string;
    estado?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ModuloService {
    private apiUrl = `${environment.apiUrl}/modulo`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Modulo[]> {
        return this.http.get<Modulo[]>(this.apiUrl);
    }

    getOne(id: number): Observable<Modulo> {
        return this.http.get<Modulo>(`${this.apiUrl}/${id}`);
    }

    create(data: CreateModuloDto): Observable<Modulo> {
        return this.http.post<Modulo>(this.apiUrl, data);
    }

    update(id: number, data: UpdateModuloDto): Observable<Modulo> {
        return this.http.patch<Modulo>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: number): Observable<Modulo> {
        return this.http.delete<Modulo>(`${this.apiUrl}/${id}`);
    }
}
