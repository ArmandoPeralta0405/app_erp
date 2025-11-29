import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Programa {
    id_programa: number;
    titulo: string;
    ruta_acceso: string;
    codigo_alfanumerico: string;
    id_modulo: number;
    id_categoria_programa: number;
    estado?: boolean;
    permisos?: {
        lectura: boolean;
        escritura: boolean;
        eliminacion: boolean;
    };
    modulo?: {
        id_modulo: number;
        nombre: string;
    };
    categoria_programa?: {
        id_categoria_programa: number;
        nombre: string;
    };
}

export interface CategoriaConProgramas {
    id_categoria: number;
    nombre_categoria: string;
    programas: Programa[];
}

export interface ModuloConProgramas {
    id_modulo: number;
    nombre_modulo: string;
    categorias: CategoriaConProgramas[];
}

@Injectable({
    providedIn: 'root'
})
export class ProgramaService {
    private apiUrl = `${environment.apiUrl}/programa`;

    constructor(private http: HttpClient) { }

    // Obtener todos los programas
    getAll(): Observable<Programa[]> {
        return this.http.get<Programa[]>(this.apiUrl);
    }

    // Obtener programas del usuario autenticado
    getMyProgramas(): Observable<ModuloConProgramas[]> {
        return this.http.get<ModuloConProgramas[]>(`${environment.apiUrl}/usuario/me/programas`);
    }
}
