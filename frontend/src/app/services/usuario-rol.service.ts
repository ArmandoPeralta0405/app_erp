import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UsuarioRol {
    id_usuario: number;
    id_rol: number;
    rol?: {
        id_rol: number;
        nombre: string;
        descripcion?: string;
    };
}

export interface CreateUsuarioRolDto {
    id_usuario: number;
    id_rol: number;
}

@Injectable({
    providedIn: 'root'
})
export class UsuarioRolService {
    private apiUrl = `${environment.apiUrl}/usuario_rol`;

    constructor(private http: HttpClient) { }

    // Obtener todos los roles de un usuario
    getRolesByUsuario(idUsuario: number): Observable<UsuarioRol[]> {
        return this.http.get<UsuarioRol[]>(`${this.apiUrl}/usuario/${idUsuario}`);
    }

    // Asignar un rol a un usuario
    assign(data: CreateUsuarioRolDto): Observable<UsuarioRol> {
        return this.http.post<UsuarioRol>(this.apiUrl, data);
    }

    // Remover un rol de un usuario
    remove(idUsuario: number, idRol: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/usuario/${idUsuario}/rol/${idRol}`);
    }
}
