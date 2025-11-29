import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Empresa {
    id_empresa: number;
    razon_social: string;
    ruc: string;
    dv: string;
    telefono: string | null;
    direccion: string | null;
    correo: string | null;
    estado: boolean;
}

export interface CreateEmpresaDto {
    razon_social: string;
    ruc: string;
    dv: string;
    telefono?: string;
    direccion?: string;
    correo?: string;
    estado?: boolean;
}

export interface UpdateEmpresaDto {
    razon_social?: string;
    ruc?: string;
    dv?: string;
    telefono?: string;
    direccion?: string;
    correo?: string;
    estado?: boolean;
}

export interface CalcularDVResponse {
    ruc: string;
    dv: number;
    ruc_completo: string;
}

export interface ValidarRUCResponse {
    ruc: string;
    es_valido: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class EmpresaService {
    private apiUrl = `${environment.apiUrl}/empresa`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Empresa[]> {
        return this.http.get<Empresa[]>(this.apiUrl);
    }

    getOne(id: number): Observable<Empresa> {
        return this.http.get<Empresa>(`${this.apiUrl}/${id}`);
    }

    create(data: CreateEmpresaDto): Observable<Empresa> {
        return this.http.post<Empresa>(this.apiUrl, data);
    }

    update(id: number, data: UpdateEmpresaDto): Observable<Empresa> {
        return this.http.patch<Empresa>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: number): Observable<Empresa> {
        return this.http.delete<Empresa>(`${this.apiUrl}/${id}`);
    }

    // Calcular dígito verificador del RUC
    calcularDV(ruc: string): Observable<CalcularDVResponse> {
        return this.http.get<CalcularDVResponse>(`${this.apiUrl}/calcular-dv`, {
            params: { ruc }
        });
    }

    // Validar RUC completo
    validarRUC(ruc: string): Observable<ValidarRUCResponse> {
        return this.http.get<ValidarRUCResponse>(`${this.apiUrl}/validar-ruc`, {
            params: { ruc }
        });
    }
}
