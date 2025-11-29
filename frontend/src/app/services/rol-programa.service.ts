import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RolPrograma {
    id_rol: number;
    id_programa: number;
    acceso_lectura: boolean;
    acceso_escritura: boolean;
    acceso_eliminacion: boolean;
    rol?: {
        id_rol: number;
        nombre: string;
        descripcion?: string;
        estado: boolean;
    };
    programa?: {
        id_programa: number;
        titulo: string;
        codigo_alfanumerico: string;
        ruta_acceso: string;
        estado: boolean;
        modulo?: {
            id_modulo: number;
            nombre: string;
        };
        categoria_programa?: {
            id_categoria_programa: number;
            nombre: string;
        };
    };
}

export interface CreateRolProgramaDto {
    id_rol: number;
    id_programa: number;
    acceso_lectura?: boolean;
    acceso_escritura?: boolean;
    acceso_eliminacion?: boolean;
}

export interface UpdateRolProgramaDto {
    acceso_lectura?: boolean;
    acceso_escritura?: boolean;
    acceso_eliminacion?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class RolProgramaService {
    private apiUrl = `${environment.apiUrl}/rol_programa`;

    constructor(private http: HttpClient) { }

    // Obtener todos los permisos
    getAll(): Observable<RolPrograma[]> {
        return this.http.get<RolPrograma[]>(this.apiUrl);
    }

    // Obtener permiso específico por rol y programa
    getByRolAndPrograma(rolId: number, programaId: number): Observable<RolPrograma> {
        return this.http.get<RolPrograma>(`${this.apiUrl}/rol/${rolId}/programa/${programaId}`);
    }

    // Crear nuevo permiso
    create(data: CreateRolProgramaDto): Observable<RolPrograma> {
        return this.http.post<RolPrograma>(this.apiUrl, data);
    }

    // Actualizar permisos
    update(rolId: number, programaId: number, data: UpdateRolProgramaDto): Observable<RolPrograma> {
        return this.http.patch<RolPrograma>(`${this.apiUrl}/rol/${rolId}/programa/${programaId}`, data);
    }

    // Eliminar permiso
    delete(rolId: number, programaId: number): Observable<RolPrograma> {
        return this.http.delete<RolPrograma>(`${this.apiUrl}/rol/${rolId}/programa/${programaId}`);
    }
}
