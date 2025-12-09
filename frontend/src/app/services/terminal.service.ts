import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Terminal {
    id_terminal: number;
    nombre: string;
    limite_items?: number;
    observacion?: string;
    ultimo_numero_factura?: number;
    ultimo_numero_nota_credito?: number;
    ultimo_numero_remision?: number;
    ultimo_numero_ajuste?: number;
    estado?: boolean;
    usuario_terminal?: any[];
}

export interface CreateTerminalDto {
    nombre: string;
    limite_items?: number;
    observacion?: string;
    ultimo_numero_factura?: number;
    ultimo_numero_nota_credito?: number;
    ultimo_numero_remision?: number;
    ultimo_numero_ajuste?: number;
    estado?: boolean;
}

export interface UpdateTerminalDto {
    nombre?: string;
    limite_items?: number;
    observacion?: string;
    ultimo_numero_factura?: number;
    ultimo_numero_nota_credito?: number;
    ultimo_numero_remision?: number;
    ultimo_numero_ajuste?: number;
    estado?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class TerminalService {
    private apiUrl = `${environment.apiUrl}/terminal`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Terminal[]> {
        return this.http.get<Terminal[]>(this.apiUrl);
    }

    getById(id: number): Observable<Terminal> {
        return this.http.get<Terminal>(`${this.apiUrl}/${id}`);
    }

    create(terminal: CreateTerminalDto): Observable<Terminal> {
        return this.http.post<Terminal>(this.apiUrl, terminal);
    }

    update(id: number, terminal: UpdateTerminalDto): Observable<Terminal> {
        return this.http.patch<Terminal>(`${this.apiUrl}/${id}`, terminal);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
