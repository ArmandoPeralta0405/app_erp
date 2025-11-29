import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Modulo } from './modulo.service';
import { CategoriaPrograma } from './categoria-programa.service';

export interface ProgramaDetalle {
    id_programa: number;
    titulo: string;
    codigo_alfanumerico: string;
    ruta_acceso: string;
    id_modulo: number;
    id_categoria_programa: number;
    estado: boolean;
    modulo?: Modulo;
    categoria_programa?: CategoriaPrograma;
}

export interface CreateProgramaDto {
    titulo: string;
    codigo_alfanumerico: string;
    ruta_acceso: string;
    id_modulo: number;
    id_categoria_programa: number;
    estado?: boolean;
}

export interface UpdateProgramaDto {
    titulo?: string;
    codigo_alfanumerico?: string;
    ruta_acceso?: string;
    id_modulo?: number;
    id_categoria_programa?: number;
    estado?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ProgramaAdminService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // Obtener todos los programas
    getAll(): Observable<ProgramaDetalle[]> {
        return this.http.get<ProgramaDetalle[]>(`${this.apiUrl}/programa`);
    }

    // Obtener un programa por ID
    getById(id: number): Observable<ProgramaDetalle> {
        return this.http.get<ProgramaDetalle>(`${this.apiUrl}/programa/${id}`);
    }

    // Crear nuevo programa
    create(programa: CreateProgramaDto): Observable<ProgramaDetalle> {
        return this.http.post<ProgramaDetalle>(`${this.apiUrl}/programa`, programa);
    }

    // Actualizar programa
    update(id: number, programa: UpdateProgramaDto): Observable<ProgramaDetalle> {
        return this.http.patch<ProgramaDetalle>(`${this.apiUrl}/programa/${id}`, programa);
    }

    // Eliminar programa (lógico)
    delete(id: number): Observable<ProgramaDetalle> {
        return this.http.delete<ProgramaDetalle>(`${this.apiUrl}/programa/${id}`);
    }
}
