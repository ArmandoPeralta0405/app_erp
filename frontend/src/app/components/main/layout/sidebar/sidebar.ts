import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgramaService, ModuloConProgramas, CategoriaConProgramas } from '../../../../services/programa.service';
import { timeout, catchError, of } from 'rxjs';

@Component({
    selector: 'app-sidebar',
    imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
    templateUrl: './sidebar.html',
    styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
    // Interfaces extendidas para UI
    modulos: (ModuloConProgramas & { isCollapsed?: boolean; categorias: (CategoriaConProgramas & { isCollapsed?: boolean })[] })[] = [];
    loading = true;
    error = false;

    // Búsqueda
    searchTerm = '';
    searchResults: Array<{
        titulo: string;
        ruta: string;
        modulo: string;
        categoria: string;
    }> = [];
    showSearchResults = false;
    selectedIndex = -1;

    // Mapeo de iconos (Frontend Only)
    private iconMap: { [key: string]: string } = {
        // Módulos
        'Finanzas': 'fa-money-bill-wave',
        'Sistemas': 'fa-cogs',
        'Ventas': 'fa-shopping-cart',
        'Compras': 'fa-shopping-bag',
        'Inventario': 'fa-boxes',
        'RRHH': 'fa-users',

        // Categorías
        'Mantenimiento': 'fa-tools',
        'Mantenimientos': 'fa-tools',
        'Transaccional': 'fa-exchange-alt',
        'Transaccionales': 'fa-exchange-alt',
        'Consulta': 'fa-search',
        'Consultas': 'fa-search',
        'Proceso': 'fa-cogs',
        'Procesos': 'fa-cogs',
        'Reporte': 'fa-chart-bar',
        'Reportes': 'fa-chart-bar',
        'Administración': 'fa-user-shield',

        // Programas
        'Cotización': 'fa-exchange-alt',
        'Cotizaciones': 'fa-exchange-alt',
        'Impuesto': 'fa-percentage',
        'Impuestos': 'fa-percentage',
        'Usuarios': 'fa-user',
        'Roles': 'fa-user-tag',
        'Permisos': 'fa-key',
        'Monedas': 'fa-coins',
        'Sucursales': 'fa-building',
        'Depósitos': 'fa-warehouse',
        'Empresa': 'fa-city',
        'Departamento': 'fa-map-marker-alt',
        'Departamentos': 'fa-map-marker-alt',
        'Ciudad': 'fa-city',
        'Ciudades': 'fa-city',
        'Cliente': 'fa-user-tie',
        'Clientes': 'fa-user-tie',
        'Proveedor': 'fa-truck',
        'Proveedores': 'fa-truck',
        'MotivoAjusteInventario': 'fa-clipboard-list',
        'MotivosAjusteInventario': 'fa-clipboard-list'
    };



    constructor(
        private programaService: ProgramaService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) { }

    getIcono(nombre: string, tipo: 'modulo' | 'programa' | 'categoria'): string {
        if (!nombre) {
            if (tipo === 'modulo') return 'fa-folder';
            if (tipo === 'categoria') return 'fa-layer-group';
            return 'fa-file-alt';
        }

        // Buscar coincidencia exacta o parcial
        const key = Object.keys(this.iconMap).find(k => nombre.includes(k));

        if (key) {
            return this.iconMap[key];
        }

        // Iconos por defecto
        if (tipo === 'modulo') return 'fa-folder';
        if (tipo === 'categoria') return 'fa-layer-group';
        return 'fa-file-alt';
    }

    ngOnInit() {
        this.cargarProgramas();
    }

    cargarProgramas() {
        this.loading = true;
        this.error = false;

        this.programaService.getMyProgramas()
            .pipe(
                timeout(10000), // Timeout de 10 segundos
                catchError((error) => {
                    console.error('Error cargando programas:', error);
                    this.error = true;
                    this.loading = false;
                    this.cdr.detectChanges(); // Forzar detección de cambios
                    return of([]); // Retornar array vacío en caso de error
                })
            )
            .subscribe({
                next: (data) => {
                    console.log('Programas cargados:', data);
                    // Inicializar isCollapsed en true (colapsado)
                    this.modulos = data.map(m => ({
                        ...m,
                        isCollapsed: true,
                        categorias: m.categorias.map(c => ({
                            ...c,
                            isCollapsed: true
                        }))
                    }));
                    this.loading = false;
                    this.cdr.detectChanges(); // Forzar detección de cambios
                },
                error: (error) => {
                    console.error('Error en subscribe:', error);
                    this.error = true;
                    this.loading = false;
                    this.cdr.detectChanges(); // Forzar detección de cambios
                }
            });
    }

    toggleModulo(modulo: any) {
        modulo.isCollapsed = !modulo.isCollapsed;
    }

    toggleCategoria(categoria: any) {
        categoria.isCollapsed = !categoria.isCollapsed;
    }

    onSearch() {
        if (!this.searchTerm || this.searchTerm.trim().length < 2) {
            this.searchResults = [];
            this.showSearchResults = false;
            this.selectedIndex = -1;
            return;
        }

        const term = this.searchTerm.toLowerCase().trim();
        this.searchResults = [];

        // Buscar en todos los módulos, categorías y programas
        this.modulos.forEach(modulo => {
            modulo.categorias.forEach(categoria => {
                categoria.programas.forEach(programa => {
                    // Buscar en título, código o ruta
                    if (
                        programa.titulo.toLowerCase().includes(term) ||
                        programa.codigo_alfanumerico?.toLowerCase().includes(term) ||
                        programa.ruta_acceso.toLowerCase().includes(term)
                    ) {
                        this.searchResults.push({
                            titulo: programa.titulo,
                            ruta: '/app' + programa.ruta_acceso,
                            modulo: modulo.nombre_modulo,
                            categoria: categoria.nombre_categoria
                        });
                    }
                });
            });
        });

        this.showSearchResults = this.searchResults.length > 0;
        this.selectedIndex = -1;
    }

    onSearchKeyDown(event: KeyboardEvent) {
        if (!this.showSearchResults || this.searchResults.length === 0) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, this.searchResults.length - 1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                break;
            case 'Enter':
                event.preventDefault();
                if (this.selectedIndex >= 0 && this.selectedIndex < this.searchResults.length) {
                    this.navigateToResult(this.searchResults[this.selectedIndex]);
                }
                break;
            case 'Escape':
                this.clearSearch();
                break;
        }
    }

    navigateToResult(result: any) {
        this.router.navigate([result.ruta]);
        this.clearSearch();
    }

    clearSearch() {
        this.searchTerm = '';
        this.searchResults = [];
        this.showSearchResults = false;
        this.selectedIndex = -1;
    }
}
