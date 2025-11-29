import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CategoriaPrograma {
    id_categoria_programa: number;
    nombre: string;
    descripcion: string | null;
    estado: boolean;
}

export interface CreateCategoriaProgramaDto {
    nombre: string;
    descripcion?: string;
    estado?: boolean;
}

export interface UpdateCategoriaProgramaDto {
    nombre?: string;
    descripcion?: string;
    estado?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CategoriaProgramaService {
    private apiUrl = `${environment.apiUrl}/categoria_programa`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<CategoriaPrograma[]> {
        return this.http.get<CategoriaPrograma[]>(this.apiUrl);
    }

    getOne(id: number): Observable<CategoriaPrograma> {
        return this.http.get<CategoriaPrograma>(`${this.apiUrl}/${id}`);
    }

    create(data: CreateCategoriaProgramaDto): Observable<CategoriaPrograma> {
        return this.http.post<CategoriaPrograma>(this.apiUrl, data);
    }

    update(id: number, data: UpdateCategoriaProgramaDto): Observable<CategoriaPrograma> {
        return this.http.patch<CategoriaPrograma>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: number): Observable<CategoriaPrograma> {
        return this.http.delete<CategoriaPrograma>(`${this.apiUrl}/${id}`);
    }
}
