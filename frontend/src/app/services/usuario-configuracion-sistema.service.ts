import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UsuarioConfiguracionSistema {
    id_usuario: number;
    id_configuracion_sistema: number;
    usuario?: {
        id_usuario: number;
        nombre: string;
        apellido: string;
        alias: string;
    };
    configuracion_sistema?: {
        id_configuracion_sistema: number;
        descripcion: string;
        estado: boolean;
    };
}

export interface CreateUsuarioConfiguracionSistemaDto {
    id_usuario: number;
    id_configuracion_sistema: number;
}

@Injectable({
    providedIn: 'root'
})
export class UsuarioConfiguracionSistemaService {
    private apiUrl = `${environment.apiUrl}/usuario-configuracion-sistema`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<UsuarioConfiguracionSistema[]> {
        return this.http.get<UsuarioConfiguracionSistema[]>(this.apiUrl);
    }

    getByUsuario(id_usuario: number): Observable<UsuarioConfiguracionSistema[]> {
        return this.http.get<UsuarioConfiguracionSistema[]>(`${this.apiUrl}/usuario/${id_usuario}`);
    }

    getByConfiguracion(id_configuracion_sistema: number): Observable<UsuarioConfiguracionSistema[]> {
        return this.http.get<UsuarioConfiguracionSistema[]>(`${this.apiUrl}/configuracion/${id_configuracion_sistema}`);
    }

    getOne(id_usuario: number, id_configuracion_sistema: number): Observable<UsuarioConfiguracionSistema> {
        return this.http.get<UsuarioConfiguracionSistema>(`${this.apiUrl}/${id_usuario}/${id_configuracion_sistema}`);
    }

    create(data: CreateUsuarioConfiguracionSistemaDto): Observable<UsuarioConfiguracionSistema> {
        return this.http.post<UsuarioConfiguracionSistema>(this.apiUrl, data);
    }

    delete(id_usuario: number, id_configuracion_sistema: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id_usuario}/${id_configuracion_sistema}`);
    }

    deleteAllByUsuario(id_usuario: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/usuario/${id_usuario}`);
    }

    deleteAllByConfiguracion(id_configuracion_sistema: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/configuracion/${id_configuracion_sistema}`);
    }
}
