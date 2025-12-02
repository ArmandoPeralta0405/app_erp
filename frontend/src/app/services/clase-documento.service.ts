import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ClaseDocumento {
    id_clase_documento: number;
    nombre: string;
}

export interface CreateClaseDocumentoDto {
    nombre: string;
}

export interface UpdateClaseDocumentoDto {
    nombre?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ClaseDocumentoService {
    private apiUrl = `${environment.apiUrl}/clase-documento`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<ClaseDocumento[]> {
        return this.http.get<ClaseDocumento[]>(this.apiUrl);
    }

    getById(id: number): Observable<ClaseDocumento> {
        return this.http.get<ClaseDocumento>(`${this.apiUrl}/${id}`);
    }

    create(claseDocumento: CreateClaseDocumentoDto): Observable<ClaseDocumento> {
        return this.http.post<ClaseDocumento>(this.apiUrl, claseDocumento);
    }

    update(id: number, claseDocumento: UpdateClaseDocumentoDto): Observable<ClaseDocumento> {
        return this.http.patch<ClaseDocumento>(`${this.apiUrl}/${id}`, claseDocumento);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
