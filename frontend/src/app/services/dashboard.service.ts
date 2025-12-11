import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
    kpis: {
        totalInventory: number;
        adjustmentsThisMonth: number;
        movementsToday: number;
        criticalStock: number;
    };
    chartData: {
        date: Date;
        count: number;
    }[];
    recentAdjustments: {
        id_movimiento_stock: number;
        numero_comprobante: number;
        fecha_documento: Date;
        sucursal: string;
        total_ml: number;
    }[];
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = `${environment.apiUrl}/dashboard`;

    constructor(private http: HttpClient) { }

    getInventoryStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.apiUrl}/inventarios/stats`);
    }
}
