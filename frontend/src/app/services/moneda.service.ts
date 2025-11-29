import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Moneda {
    id_moneda: number;
    nombre: string;
    simbolo: string;
    cantidad_decimal: number;
    estado: boolean;
}

export interface CreateMonedaDto {
    nombre: string;
    simbolo: string;
    cantidad_decimal?: number;
    estado?: boolean;
}

export interface UpdateMonedaDto {
    nombre?: string;
    simbolo?: string;
    cantidad_decimal?: number;
    estado?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class MonedaService {
    private apiUrl = `${environment.apiUrl}/moneda`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Moneda[]> {
        return this.http.get<Moneda[]>(this.apiUrl);
    }

    getOne(id: number): Observable<Moneda> {
        return this.http.get<Moneda>(`${this.apiUrl}/${id}`);
    }

    create(data: CreateMonedaDto): Observable<Moneda> {
        return this.http.post<Moneda>(this.apiUrl, data);
    }

    update(id: number, data: UpdateMonedaDto): Observable<Moneda> {
        return this.http.patch<Moneda>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: number): Observable<Moneda> {
        return this.http.delete<Moneda>(`${this.apiUrl}/${id}`);
    }
}
