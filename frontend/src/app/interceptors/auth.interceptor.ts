import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getToken();

    // Clonar la petición y agregar el token si existe
    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    // Manejar errores de autenticación
    return next(req).pipe(
        catchError((error) => {
            if (error.status === 401) {
                // Token inválido o expirado
                authService.logout();
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
};
