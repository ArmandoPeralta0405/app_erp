import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MotivoAjusteInventario {
    id_motivo_ajuste_inventario: number;
    nombre: string;
    descripcion?: string;
    estado: boolean;
}

export interface CreateMotivoAjusteInventarioDto {
    nombre: string;
    descripcion?: string;
    estado?: boolean;
}

export interface UpdateMotivoAjusteInventarioDto {
    nombre?: string;
    descripcion?: string;
    estado?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class MotivoAjusteInventarioService {
    private apiUrl = `${environment.apiUrl}/motivo-ajuste-inventario`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<MotivoAjusteInventario[]> {
        return this.http.get<MotivoAjusteInventario[]>(this.apiUrl);
    }

    getById(id: number): Observable<MotivoAjusteInventario> {
        return this.http.get<MotivoAjusteInventario>(`${this.apiUrl}/${id}`);
    }

    create(motivo: CreateMotivoAjusteInventarioDto): Observable<MotivoAjusteInventario> {
        return this.http.post<MotivoAjusteInventario>(this.apiUrl, motivo);
    }

    update(id: number, motivo: UpdateMotivoAjusteInventarioDto): Observable<MotivoAjusteInventario> {
        return this.http.patch<MotivoAjusteInventario>(`${this.apiUrl}/${id}`, motivo);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
