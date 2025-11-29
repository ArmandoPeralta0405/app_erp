import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pais } from './pais.service';

export interface Departamento {
    id_departamento: number;
    id_pais: number;
    nombre: string;
    estado?: boolean;
    pais?: Pais;
}

export interface CreateDepartamentoDto {
    id_pais: number;
    nombre: string;
    estado?: boolean;
}

export interface UpdateDepartamentoDto {
    id_pais?: number;
    nombre?: string;
    estado?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class DepartamentoService {
    private apiUrl = `${environment.apiUrl}/departamento`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Departamento[]> {
        return this.http.get<Departamento[]>(this.apiUrl);
    }

    getById(id: number): Observable<Departamento> {
        return this.http.get<Departamento>(`${this.apiUrl}/${id}`);
    }

    create(departamento: CreateDepartamentoDto): Observable<Departamento> {
        return this.http.post<Departamento>(this.apiUrl, departamento);
    }

    update(id: number, departamento: UpdateDepartamentoDto): Observable<Departamento> {
        return this.http.patch<Departamento>(`${this.apiUrl}/${id}`, departamento);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
