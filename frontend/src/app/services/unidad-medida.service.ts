import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UnidadMedida {
    id_unidad_medida: number;
    nombre: string;
    simbolo: string;
    factor_conversion: number;
    codigo_iso?: string;
    es_base: boolean;
    estado: boolean;
}

export interface CreateUnidadMedidaDto {
    nombre: string;
    simbolo: string;
    factor_conversion: number;
    codigo_iso?: string;
    es_base?: boolean;
    estado?: boolean;
}

export interface UpdateUnidadMedidaDto {
    nombre?: string;
    simbolo?: string;
    factor_conversion?: number;
    codigo_iso?: string;
    es_base?: boolean;
    estado?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class UnidadMedidaService {
    private apiUrl = `${environment.apiUrl}/unidad-medida`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<UnidadMedida[]> {
        return this.http.get<UnidadMedida[]>(this.apiUrl);
    }

    getById(id: number): Observable<UnidadMedida> {
        return this.http.get<UnidadMedida>(`${this.apiUrl}/${id}`);
    }

    create(dto: CreateUnidadMedidaDto): Observable<UnidadMedida> {
        return this.http.post<UnidadMedida>(this.apiUrl, dto);
    }

    update(id: number, dto: UpdateUnidadMedidaDto): Observable<UnidadMedida> {
        return this.http.patch<UnidadMedida>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
