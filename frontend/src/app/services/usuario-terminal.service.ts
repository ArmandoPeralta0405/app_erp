import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Terminal } from './terminal.service';

export interface UsuarioTerminal {
    id_usuario: number;
    id_terminal: number;
    usuario?: {
        id_usuario: number;
        nombre: string;
        apellido: string;
        alias: string;
    };
    terminal?: Terminal;
}

export interface CreateUsuarioTerminalDto {
    id_usuario: number;
    id_terminal: number;
}

export interface AssignTerminalesToUsuarioDto {
    id_usuario: number;
    id_terminales: number[];
}

@Injectable({
    providedIn: 'root'
})
export class UsuarioTerminalService {
    private apiUrl = `${environment.apiUrl}/usuario-terminal`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<UsuarioTerminal[]> {
        return this.http.get<UsuarioTerminal[]>(this.apiUrl);
    }

    getByUsuario(id_usuario: number): Observable<UsuarioTerminal[]> {
        return this.http.get<UsuarioTerminal[]>(`${this.apiUrl}/usuario/${id_usuario}`);
    }

    getByTerminal(id_terminal: number): Observable<UsuarioTerminal[]> {
        return this.http.get<UsuarioTerminal[]>(`${this.apiUrl}/terminal/${id_terminal}`);
    }

    getOne(id_usuario: number, id_terminal: number): Observable<UsuarioTerminal> {
        return this.http.get<UsuarioTerminal>(`${this.apiUrl}/${id_usuario}/${id_terminal}`);
    }

    create(data: CreateUsuarioTerminalDto): Observable<UsuarioTerminal> {
        return this.http.post<UsuarioTerminal>(this.apiUrl, data);
    }

    delete(id_usuario: number, id_terminal: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id_usuario}/${id_terminal}`);
    }

    assignTerminalesToUsuario(data: AssignTerminalesToUsuarioDto): Observable<UsuarioTerminal[]> {
        return this.http.post<UsuarioTerminal[]>(`${this.apiUrl}/assign-terminales-to-usuario`, data);
    }
}
