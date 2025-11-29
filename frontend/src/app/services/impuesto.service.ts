import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Impuesto {
    id_impuesto: number;
    nombre: string;
    abreviacion: string;
    valor_calculo: number;
    estado: boolean;
}

export interface CreateImpuestoDto {
    nombre: string;
    abreviacion: string;
    valor_calculo: number;
    estado?: boolean;
}

export interface UpdateImpuestoDto {
    nombre?: string;
    abreviacion?: string;
    valor_calculo?: number;
    estado?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ImpuestoService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // Obtener todos los impuestos
    getAll(): Observable<Impuesto[]> {
        return this.http.get<Impuesto[]>(`${this.apiUrl}/impuesto`);
    }

    // Obtener un impuesto por ID
    getById(id: number): Observable<Impuesto> {
        return this.http.get<Impuesto>(`${this.apiUrl}/impuesto/${id}`);
    }

    // Crear nuevo impuesto
    create(impuesto: CreateImpuestoDto): Observable<Impuesto> {
        return this.http.post<Impuesto>(`${this.apiUrl}/impuesto`, impuesto);
    }

    // Actualizar impuesto
    update(id: number, impuesto: UpdateImpuestoDto): Observable<Impuesto> {
        return this.http.patch<Impuesto>(`${this.apiUrl}/impuesto/${id}`, impuesto);
    }

    // Eliminar impuesto (lógico)
    delete(id: number): Observable<Impuesto> {
        return this.http.delete<Impuesto>(`${this.apiUrl}/impuesto/${id}`);
    }
}
