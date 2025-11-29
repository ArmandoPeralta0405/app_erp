import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Marca {
    id_marca: number;
    nombre: string;
}

export interface CreateMarcaDto {
    nombre: string;
}

export interface UpdateMarcaDto {
    nombre?: string;
}
@Injectable({
    providedIn: 'root'
})
export class MarcaService {
    private apiUrl = `${environment.apiUrl}/marca`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Marca[]> {
        return this.http.get<Marca[]>(this.apiUrl);
    }

    getById(id: number): Observable<Marca> {
        return this.http.get<Marca>(`${this.apiUrl}/${id}`);
    }

    create(marca: CreateMarcaDto): Observable<Marca> {
        return this.http.post<Marca>(this.apiUrl, marca);
    }

    update(id: number, marca: UpdateMarcaDto): Observable<Marca> {
        return this.http.patch<Marca>(`${this.apiUrl}/${id}`, marca);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
