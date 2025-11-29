import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Pais {
    id_pais: number;
    nombre: string;
    codigo_iso: string;
    codigo_iso2?: string;
    codigo_telefono?: string;
    estado?: boolean;
}

export interface CreatePaisDto {
    nombre: string;
    codigo_iso: string;
    codigo_iso2?: string;
    codigo_telefono?: string;
    estado?: boolean;
}

export interface UpdatePaisDto {
    nombre?: string;
    codigo_iso?: string;
    codigo_iso2?: string;
    codigo_telefono?: string;
    estado?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class PaisService {
    private apiUrl = `${environment.apiUrl}/pais`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Pais[]> {
        return this.http.get<Pais[]>(this.apiUrl);
    }

    getById(id: number): Observable<Pais> {
        return this.http.get<Pais>(`${this.apiUrl}/${id}`);
    }

    create(pais: CreatePaisDto): Observable<Pais> {
        return this.http.post<Pais>(this.apiUrl, pais);
    }

    update(id: number, pais: UpdatePaisDto): Observable<Pais> {
        return this.http.patch<Pais>(`${this.apiUrl}/${id}`, pais);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
