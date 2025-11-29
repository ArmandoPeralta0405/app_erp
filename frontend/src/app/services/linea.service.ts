import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Linea {
    id_linea: number;
    nombre: string;
}

export interface CreateLineaDto {
    nombre: string;
}

export interface UpdateLineaDto {
    nombre?: string;
}
@Injectable({
    providedIn: 'root'
})
export class LineaService {
    private apiUrl = `${environment.apiUrl}/linea`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Linea[]> {
        return this.http.get<Linea[]>(this.apiUrl);
    }

    getById(id: number): Observable<Linea> {
        return this.http.get<Linea>(`${this.apiUrl}/${id}`);
    }

    create(linea: CreateLineaDto): Observable<Linea> {
        return this.http.post<Linea>(this.apiUrl, linea);
    }

    update(id: number, linea: UpdateLineaDto): Observable<Linea> {
        return this.http.patch<Linea>(`${this.apiUrl}/${id}`, linea);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
