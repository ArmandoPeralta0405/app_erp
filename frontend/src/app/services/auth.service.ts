import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PermissionService } from './permission.service';

interface LoginResponse {
    access_token: string;
    refresh_token: string;
    usuario: {
        id: number;
        alias: string;
        nombre: string;
        apellido: string;
        roles: Array<{ id: number; nombre: string }>;
    };
}

interface UserData {
    id: number;
    alias: string;
    nombre: string;
    apellido: string;
    roles: Array<{ id: number; nombre: string }>;
}

interface DecodedToken {
    alias: string;
    sub: number;
    roles: Array<{ id: number; nombre: string }>;
    iat: number;
    exp: number;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private permissionService: PermissionService
    ) { }

    login(alias: string, clave: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
            alias,
            clave
        });
    }

    saveToken(token: string): void {
        localStorage.setItem('access_token', token);
    }

    saveRefreshToken(token: string): void {
        localStorage.setItem('refresh_token', token);
    }

    saveUserData(user: UserData): void {
        localStorage.setItem('user_data', JSON.stringify(user));
    }

    getCurrentUser(): UserData | null {
        const userData = localStorage.getItem('user_data');
        if (!userData) return null;
        try {
            return JSON.parse(userData);
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token');
    }

    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        this.permissionService.clearPermissions();
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        // Verificar si el token está expirado
        return !this.isTokenExpired();
    }

    // Decodificar el token JWT (sin verificar firma, solo lectura)
    private decodeToken(token: string): DecodedToken | null {
        try {
            const payload = token.split('.')[1];
            const decoded = atob(payload);
            return JSON.parse(decoded);
        } catch (error) {
            console.error('Error decodificando token:', error);
            return null;
        }
    }

    // Verificar si el token está expirado
    isTokenExpired(): boolean {
        const token = this.getToken();
        if (!token) return true;

        const decoded = this.decodeToken(token);
        if (!decoded || !decoded.exp) return true;

        // exp está en segundos, Date.now() en milisegundos
        const expirationDate = decoded.exp * 1000;
        return Date.now() >= expirationDate;
    }

    // Obtener información del usuario desde el token
    getUserInfo(): DecodedToken | null {
        const token = this.getToken();
        if (!token) return null;
        return this.decodeToken(token);
    }

    // Renovar el access token usando el refresh token
    refreshAccessToken(): Observable<{ access_token: string }> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No hay refresh token disponible');
        }

        return this.http.post<{ access_token: string }>(`${this.apiUrl}/auth/refresh`, {
            refresh_token: refreshToken
        });
    }
}
