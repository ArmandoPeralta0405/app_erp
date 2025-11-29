import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
    id_usuario: number;
    nombre: string;
    apellido: string;
    cedula?: string;
    telefono?: string;
    direccion?: string;
    estado: boolean;
    alias: string;
    fecha_creacion?: Date;
    fecha_actualizacion?: Date;
    // Relación con roles (opcional, para cuando se incluya en la respuesta)
    usuario_rol?: Array<{
        id_rol: number;
        rol: {
            id_rol: number;
            nombre: string;
        };
    }>;
}

export interface CreateUsuarioDto {
    nombre: string;
    apellido: string;
    alias: string;
    clave: string;
    cedula?: string;
    telefono?: string;
    direccion?: string;
    estado?: boolean;
}

export interface UpdateUsuarioDto {
    nombre?: string;
    apellido?: string;
    alias?: string;
    clave?: string;
    cedula?: string;
    telefono?: string;
    direccion?: string;
    estado?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private apiUrl = `${environment.apiUrl}/usuario`;

    constructor(private http: HttpClient) { }

    // Obtener todos los usuarios
    getAll(): Observable<Usuario[]> {
        return this.http.get<Usuario[]>(this.apiUrl);
    }

    // Obtener usuario por ID
    getById(id: number): Observable<Usuario> {
        return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
    }

    // Crear nuevo usuario
    create(data: CreateUsuarioDto): Observable<Usuario> {
        return this.http.post<Usuario>(this.apiUrl, data);
    }

    // Actualizar usuario
    update(id: number, data: UpdateUsuarioDto): Observable<Usuario> {
        return this.http.patch<Usuario>(`${this.apiUrl}/${id}`, data);
    }

    // Eliminar usuario (lógico)
    delete(id: number): Observable<Usuario> {
        return this.http.delete<Usuario>(`${this.apiUrl}/${id}`);
    }
}
