import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Rol {
    id_rol: number;
    nombre: string;
    descripcion?: string;
    estado: boolean;
}

export interface CreateRolDto {
    nombre: string;
    descripcion?: string;
    estado?: boolean;
}

export interface UpdateRolDto {
    nombre?: string;
    descripcion?: string;
    estado?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class RolService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // Obtener todos los roles
    getAll(): Observable<Rol[]> {
        return this.http.get<Rol[]>(`${this.apiUrl}/rol`);
    }

    // Obtener un rol por ID
    getById(id: number): Observable<Rol> {
        return this.http.get<Rol>(`${this.apiUrl}/rol/${id}`);
    }

    // Crear nuevo rol
    create(rol: CreateRolDto): Observable<Rol> {
        return this.http.post<Rol>(`${this.apiUrl}/rol`, rol);
    }

    // Actualizar rol
    update(id: number, rol: UpdateRolDto): Observable<Rol> {
        return this.http.patch<Rol>(`${this.apiUrl}/rol/${id}`, rol);
    }

    // Eliminar rol (lógico)
    delete(id: number): Observable<Rol> {
        return this.http.delete<Rol>(`${this.apiUrl}/rol/${id}`);
    }
}
