import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Tipo_articulo {
    id_tipo_articulo: number;
    nombre: string;
}

export interface CreateTipo_articuloDto {
    nombre: string;
}

export interface UpdateTipo_articuloDto {
    nombre?: string;
}
@Injectable({
    providedIn: 'root'
})
export class Tipo_articuloService {
    private apiUrl = `${environment.apiUrl}/tipo_articulo`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Tipo_articulo[]> {
        return this.http.get<Tipo_articulo[]>(this.apiUrl);
    }

    getById(id: number): Observable<Tipo_articulo> {
        return this.http.get<Tipo_articulo>(`${this.apiUrl}/${id}`);
    }

    create(tipo_articulo: CreateTipo_articuloDto): Observable<Tipo_articulo> {
        return this.http.post<Tipo_articulo>(this.apiUrl, tipo_articulo);
    }

    update(id: number, tipo_articulo: UpdateTipo_articuloDto): Observable<Tipo_articulo> {
        return this.http.patch<Tipo_articulo>(`${this.apiUrl}/${id}`, tipo_articulo);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
