import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Articulo {
    id_articulo: number;
    codigo_alfanumerico?: string;
    referencia?: string;
    nombre: string;
    descripcion?: string;
    id_linea?: number;
    id_tipo_articulo?: number;
    id_marca?: number;
    id_unidad_medida: number;
    id_impuesto?: number;
    estado: boolean;

    // Relaciones
    linea?: any;
    tipo_articulo?: any;
    marca?: any;
    unidad_medida?: any;
    impuesto?: any;
    articulo_codigo_barra?: ArticuloCodigoBarra[];
}

export interface ArticuloCodigoBarra {
    id_articulo: number;
    codigo_barra: string;
    tipo_codigo_barra?: string;
    id_unidad_medida: number;
    es_principal: boolean;
    estado: boolean;
    unidad_medida?: any;
}

export interface CreateArticuloDto {
    codigo_alfanumerico?: string;
    referencia?: string;
    nombre: string;
    descripcion?: string;
    id_linea?: number;
    id_tipo_articulo?: number;
    id_marca?: number;
    id_unidad_medida: number;
    id_impuesto?: number;
    estado?: boolean;
    usuario_creacion?: number;
    usuario_actualizacion?: number;
}

export interface UpdateArticuloDto extends Partial<CreateArticuloDto> { }

@Injectable({
    providedIn: 'root'
})
export class ArticuloService {
    private apiUrl = `${environment.apiUrl}/articulo`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Articulo[]> {
        return this.http.get<Articulo[]>(this.apiUrl);
    }

    getById(id: number): Observable<Articulo> {
        return this.http.get<Articulo>(`${this.apiUrl}/${id}`);
    }

    create(dto: CreateArticuloDto): Observable<Articulo> {
        return this.http.post<Articulo>(this.apiUrl, dto);
    }

    update(id: number, dto: UpdateArticuloDto): Observable<Articulo> {
        return this.http.patch<Articulo>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
