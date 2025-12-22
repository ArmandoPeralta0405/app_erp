import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Concepto {
    id_concepto: number;
    descripcion: string;
    tipo_concepto: string; // 'D' | 'C'
    id_cuenta_contable?: number;
    estado?: boolean;
    cuenta_contable?: {
        id_cuenta_contable: number;
        numero_cuenta: string;
        descripcion: string;
        nivel: number;
        estado?: boolean;
    };
}

export interface CreateConceptoDto {
    descripcion: string;
    tipo_concepto: string;
    id_cuenta_contable?: number;
    estado?: boolean;
}

export interface UpdateConceptoDto {
    descripcion?: string;
    tipo_concepto?: string;
    id_cuenta_contable?: number;
    estado?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ConceptoService {
    private apiUrl = `${environment.apiUrl}/concepto`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Concepto[]> {
        return this.http.get<Concepto[]>(this.apiUrl);
    }

    getById(id: number): Observable<Concepto> {
        return this.http.get<Concepto>(`${this.apiUrl}/${id}`);
    }

    create(concepto: CreateConceptoDto): Observable<Concepto> {
        return this.http.post<Concepto>(this.apiUrl, concepto);
    }

    update(id: number, concepto: UpdateConceptoDto): Observable<Concepto> {
        return this.http.patch<Concepto>(`${this.apiUrl}/${id}`, concepto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
