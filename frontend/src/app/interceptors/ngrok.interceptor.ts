import { HttpInterceptorFn } from '@angular/common/http';

export const ngrokInterceptor: HttpInterceptorFn = (req, next) => {
    // Agregar header para evitar la página de advertencia de ngrok
    const clonedRequest = req.clone({
        setHeaders: {
            'ngrok-skip-browser-warning': 'true'
        }
    });

    return next(clonedRequest);
};
