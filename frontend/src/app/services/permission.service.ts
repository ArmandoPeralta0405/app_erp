import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ProgramaService, ModuloConProgramas } from './programa.service';

export interface Permisos {
    lectura: boolean;
    escritura: boolean;
    eliminacion: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class PermissionService {
    private permisosMap: Map<string, Permisos> = new Map();
    private loaded = false;
    private readonly STORAGE_KEY = 'user_permissions';

    constructor(
        private programaService: ProgramaService,
        private router: Router
    ) {
        this.loadFromStorage();
    }

    /**
     * Cargar permisos del usuario desde el backend
     * Debe llamarse al iniciar sesión
     */
    loadPermissions(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.programaService.getMyProgramas().subscribe({
                next: (modulos: ModuloConProgramas[]) => {
                    this.permisosMap.clear();

                    // Extraer permisos de cada programa
                    modulos.forEach(modulo => {
                        modulo.categorias.forEach(categoria => {
                            categoria.programas.forEach(programa => {
                                if (programa.permisos) {
                                    // Usar ruta_acceso como clave
                                    this.permisosMap.set(programa.ruta_acceso, programa.permisos);
                                }
                            });
                        });
                    });

                    this.saveToStorage();
                    this.loaded = true;
                    resolve();
                },
                error: (err) => {
                    console.error('Error al cargar permisos:', err);
                    reject(err);
                }
            });
        });
    }

    /**
     * Guardar permisos en localStorage
     */
    private saveToStorage(): void {
        try {
            const permissionsObj: { [key: string]: Permisos } = {};
            this.permisosMap.forEach((value, key) => {
                permissionsObj[key] = value;
            });
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(permissionsObj));
        } catch (e) {
            console.error('Error saving permissions to storage', e);
        }
    }

    /**
     * Cargar permisos desde localStorage
     */
    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const permissionsObj = JSON.parse(stored);
                this.permisosMap.clear();

                // Verificar que sea un objeto válido
                if (permissionsObj && typeof permissionsObj === 'object') {
                    Object.keys(permissionsObj).forEach(key => {
                        this.permisosMap.set(key, permissionsObj[key]);
                    });
                    this.loaded = true;
                }
            }
        } catch (e) {
            console.error('Error cargando permisos del storage:', e);
            // Limpiar localStorage corrupto
            localStorage.removeItem(this.STORAGE_KEY);
        }
    }

    /**
     * Obtener permisos para una ruta específica
     */
    getPermissionsForRoute(ruta: string): Permisos | null {
        // Normalizar la ruta (quitar /app si existe)
        const rutaNormalizada = ruta.replace('/app', '');
        return this.permisosMap.get(rutaNormalizada) || null;
    }

    /**
     * Verificar si el usuario puede leer (acceder) a una ruta
     */
    canRead(ruta?: string): boolean {
        if (!ruta) {
            ruta = this.router.url;
        }
        const permisos = this.getPermissionsForRoute(ruta);
        return permisos?.lectura || false;
    }

    /**
     * Verificar si el usuario puede escribir (crear/editar) en una ruta
     */
    canWrite(ruta?: string): boolean {
        if (!ruta) {
            ruta = this.router.url;
        }
        const permisos = this.getPermissionsForRoute(ruta);
        return permisos?.escritura || false;
    }

    /**
     * Verificar si el usuario puede eliminar en una ruta
     */
    canDelete(ruta?: string): boolean {
        if (!ruta) {
            ruta = this.router.url;
        }
        const permisos = this.getPermissionsForRoute(ruta);
        return permisos?.eliminacion || false;
    }

    /**
     * Verificar si los permisos están cargados
     */
    isLoaded(): boolean {
        return this.loaded;
    }

    /**
     * Limpiar permisos (al cerrar sesión)
     */
    clearPermissions(): void {
        this.permisosMap.clear();
        this.loaded = false;
        localStorage.removeItem(this.STORAGE_KEY);
    }
}
