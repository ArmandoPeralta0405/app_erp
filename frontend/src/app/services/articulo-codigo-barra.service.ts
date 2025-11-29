import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ArticuloCodigoBarra } from './articulo.service';

export interface CreateArticuloCodigoBarraDto {
    id_articulo: number;
    codigo_barra: string;
    tipo_codigo_barra?: string;
    id_unidad_medida: number;
    es_principal?: boolean;
    estado?: boolean;
}

export interface UpdateArticuloCodigoBarraDto extends Partial<CreateArticuloCodigoBarraDto> { }

@Injectable({
    providedIn: 'root'
})
export class ArticuloCodigoBarraService {
    private apiUrl = `${environment.apiUrl}/articulo-codigo-barra`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<ArticuloCodigoBarra[]> {
        return this.http.get<ArticuloCodigoBarra[]>(this.apiUrl);
    }

    getByArticulo(idArticulo: number): Observable<ArticuloCodigoBarra[]> {
        return this.http.get<ArticuloCodigoBarra[]>(`${this.apiUrl}/articulo/${idArticulo}`);
    }

    getOne(idArticulo: number, codigoBarra: string): Observable<ArticuloCodigoBarra> {
        return this.http.get<ArticuloCodigoBarra>(`${this.apiUrl}/${idArticulo}/${codigoBarra}`);
    }

    create(dto: CreateArticuloCodigoBarraDto): Observable<ArticuloCodigoBarra> {
        return this.http.post<ArticuloCodigoBarra>(this.apiUrl, dto);
    }

    update(idArticulo: number, codigoBarra: string, dto: UpdateArticuloCodigoBarraDto): Observable<ArticuloCodigoBarra> {
        return this.http.patch<ArticuloCodigoBarra>(`${this.apiUrl}/${idArticulo}/${codigoBarra}`, dto);
    }

    delete(idArticulo: number, codigoBarra: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${idArticulo}/${codigoBarra}`);
    }
}
