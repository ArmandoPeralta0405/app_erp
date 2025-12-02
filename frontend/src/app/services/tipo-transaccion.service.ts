import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ClaseDocumento } from './clase-documento.service';

export interface TipoTransaccion {
    id_tipo_transaccion: number;
    id_clase_documento: number;
    nombre: string;
    abreviacion?: string;
    descripcion?: string;
    tipo: 'C' | 'D';
    maneja_iva: boolean;
    origen: 'E' | 'R';
    estado: boolean;
    clase_documento?: ClaseDocumento;
}

export interface CreateTipoTransaccionDto {
    id_clase_documento: number;
    nombre: string;
    abreviacion?: string;
    descripcion?: string;
    tipo: 'C' | 'D';
    maneja_iva?: boolean;
    origen: 'E' | 'R';
    estado?: boolean;
}

export interface UpdateTipoTransaccionDto extends Partial<CreateTipoTransaccionDto> { }

@Injectable({
    providedIn: 'root'
})
export class TipoTransaccionService {
    private apiUrl = `${environment.apiUrl}/tipo-transaccion`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<TipoTransaccion[]> {
        return this.http.get<TipoTransaccion[]>(this.apiUrl);
    }

    getById(id: number): Observable<TipoTransaccion> {
        return this.http.get<TipoTransaccion>(`${this.apiUrl}/${id}`);
    }

    create(dto: CreateTipoTransaccionDto): Observable<TipoTransaccion> {
        return this.http.post<TipoTransaccion>(this.apiUrl, dto);
    }

    update(id: number, dto: UpdateTipoTransaccionDto): Observable<TipoTransaccion> {
        return this.http.patch<TipoTransaccion>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
