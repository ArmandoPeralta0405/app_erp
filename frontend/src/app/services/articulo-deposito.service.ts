import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Existencia {
    id_articulo: number;
    id_deposito: number;
    codigo: string;
    descripcion: string;
    linea: string;
    marca: string;
    unidad_medida: string;
    deposito: string;
    existencia: number;
}

@Injectable({
    providedIn: 'root'
})
export class ArticuloDepositoService {
    private apiUrl = `${environment.apiUrl}/articulo-deposito`;

    constructor(private http: HttpClient) { }

    getExistencias(filtros: any): Observable<Existencia[]> {
        let params = new HttpParams();

        if (filtros.id_deposito && filtros.id_deposito.length > 0) {
            filtros.id_deposito.forEach((id: number) => {
                params = params.append('id_deposito', id.toString());
            });
        }

        if (filtros.id_articulo) {
            params = params.set('id_articulo', filtros.id_articulo.toString());
        }

        if (filtros.id_linea) {
            params = params.set('id_linea', filtros.id_linea.toString());
        }

        if (filtros.solo_con_stock) {
            params = params.set('solo_con_stock', 'true');
        }

        return this.http.get<Existencia[]>(`${this.apiUrl}/existencias`, { params });
    }
}
