import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaisService, Pais, CreatePaisDto, UpdatePaisDto } from '../../../../../services/pais.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-pais',
    imports: [CommonModule, FormsModule],
    templateUrl: './pais.component.html',
    styleUrl: './pais.component.css',
})
export class PaisComponent implements OnInit {
    paises: Pais[] = [];
    paisesFiltrados: Pais[] = [];
    paisesPaginados: Pais[] = [];
    loading = true;

    // Búsqueda
    searchTerm = '';

    // Paginación
    currentPage = 1;
    itemsPerPage = 8;
    totalPages = 1;
    pages: number[] = [];

    // Formulario
    showForm = false;
    isEditing = false;
    currentPaisId: number | null = null;

    formData: CreatePaisDto = {
        nombre: '',
        codigo_iso: '',
        codigo_iso2: '',
        codigo_telefono: '',
        estado: true
    };

    // Permisos
    canWrite = false;
    canDelete = false;

    constructor(
        private paisService: PaisService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        // Cargar permisos para esta ruta
        const currentRoute = '/finanzas/mantenimientos/paises';
        this.canWrite = this.permissionService.canWrite(currentRoute);
        this.canDelete = this.permissionService.canDelete(currentRoute);

        this.cargarDatos();
    }

    cargarDatos() {
        this.loading = true;

        this.paisService.getAll().subscribe({
            next: (paises) => {
                this.paises = paises || [];
                this.aplicarFiltros();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                console.error('Error cargando países:', error);
                this.loading = false;
                this.cdr.detectChanges();
                Swal.fire('Error', 'Error al cargar los países', 'error');
            }
        });
    }

    aplicarFiltros() {
        // Filtrar por búsqueda
        if (this.searchTerm.trim() === '') {
            this.paisesFiltrados = [...this.paises];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.paisesFiltrados = this.paises.filter(p =>
                p.nombre.toLowerCase().includes(term) ||
                p.codigo_iso.toLowerCase().includes(term) ||
                (p.codigo_iso2 && p.codigo_iso2.toLowerCase().includes(term))
            );
        }

        // Calcular paginación
        this.totalPages = Math.ceil(this.paisesFiltrados.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = 1;
        }

        // Calcular páginas visibles (paginación inteligente)
        this.pages = this.calcularPaginasVisibles();

        // Calcular países paginados
        this.calcularPaginacion();
    }

    calcularPaginasVisibles(): number[] {
        const maxPagesToShow = 5; // Máximo de páginas a mostrar
        const pages: number[] = [];

        if (this.totalPages <= maxPagesToShow + 2) {
            // Si hay pocas páginas, mostrar todas
            return Array.from({ length: this.totalPages }, (_, i) => i + 1);
        }

        // Siempre mostrar la primera página
        pages.push(1);

        // Calcular el rango alrededor de la página actual
        let startPage = Math.max(2, this.currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);

        // Ajustar si estamos cerca del final
        if (endPage === this.totalPages - 1) {
            startPage = Math.max(2, endPage - maxPagesToShow + 1);
        }

        // Agregar puntos suspensivos si hay salto
        if (startPage > 2) {
            pages.push(-1); // -1 representa "..."
        }

        // Agregar páginas del rango
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Agregar puntos suspensivos si hay salto al final
        if (endPage < this.totalPages - 1) {
            pages.push(-1); // -1 representa "..."
        }

        // Siempre mostrar la última página
        if (this.totalPages > 1) {
            pages.push(this.totalPages);
        }

        return pages;
    }

    calcularPaginacion() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.paisesPaginados = this.paisesFiltrados.slice(start, end);
    }

    onSearch() {
        this.currentPage = 1;
        this.aplicarFiltros();
    }

    cambiarPagina(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.pages = this.calcularPaginasVisibles(); // Recalcular páginas visibles
            this.calcularPaginacion();
        }
    }

    abrirFormularioNuevo() {
        this.isEditing = false;
        this.currentPaisId = null;
        this.formData = {
            nombre: '',
            codigo_iso: '',
            codigo_iso2: '',
            codigo_telefono: '',
            estado: true
        };
        this.showForm = true;
    }

    abrirFormularioEditar(pais: Pais) {
        this.isEditing = true;
        this.currentPaisId = pais.id_pais;
        this.formData = {
            nombre: pais.nombre,
            codigo_iso: pais.codigo_iso,
            codigo_iso2: pais.codigo_iso2 || '',
            codigo_telefono: pais.codigo_telefono || '',
            estado: pais.estado !== undefined ? pais.estado : true
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.currentPaisId = null;
    }

    guardarPais() {
        // Validaciones
        if (!this.formData.nombre || this.formData.nombre.trim() === '') {
            Swal.fire('Error', 'El nombre del país es requerido', 'warning');
            return;
        }

        if (!this.formData.codigo_iso || this.formData.codigo_iso.trim() === '') {
            Swal.fire('Error', 'El código ISO es requerido', 'warning');
            return;
        }

        if (this.formData.nombre.length > 150) {
            Swal.fire('Error', 'El nombre no puede exceder 150 caracteres', 'warning');
            return;
        }

        if (this.formData.codigo_iso.length > 3) {
            Swal.fire('Error', 'El código ISO no puede exceder 3 caracteres', 'warning');
            return;
        }

        // Convertir a mayúsculas los códigos ISO
        this.formData.codigo_iso = this.formData.codigo_iso.toUpperCase();
        if (this.formData.codigo_iso2) {
            this.formData.codigo_iso2 = this.formData.codigo_iso2.toUpperCase();
        }

        if (this.isEditing && this.currentPaisId) {
            // Actualizar
            this.paisService.update(this.currentPaisId, this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'País actualizado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error actualizando país:', error);
                    Swal.fire('Error', error.error?.message || 'Error al actualizar el país', 'error');
                }
            });
        } else {
            // Crear
            this.paisService.create(this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'País creado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error creando país:', error);
                    Swal.fire('Error', error.error?.message || 'Error al crear el país', 'error');
                }
            });
        }
    }

    eliminarPais(pais: Pais) {
        Swal.fire({
            title: '¿Eliminar País?',
            text: `¿Estás seguro de eliminar "${pais.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.paisService.delete(pais.id_pais).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'País eliminado correctamente', 'success');
                        this.cargarDatos();
                    },
                    error: (error: any) => {
                        console.error('Error eliminando país:', error);
                        Swal.fire('Error', 'Error al eliminar el país', 'error');
                    }
                });
            }
        });
    }
}
