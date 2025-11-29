import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartamentoService, Departamento, CreateDepartamentoDto } from '../../../../../services/departamento.service';
import { PaisService, Pais } from '../../../../../services/pais.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-departamento',
    imports: [CommonModule, FormsModule],
    templateUrl: './departamento.component.html',
    styleUrl: './departamento.component.css',
})
export class DepartamentoComponent implements OnInit {
    departamentos: Departamento[] = [];
    departamentosFiltrados: Departamento[] = [];
    departamentosPaginados: Departamento[] = [];
    paises: Pais[] = [];
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
    currentDepartamentoId: number | null = null;

    formData: CreateDepartamentoDto = {
        id_pais: 0,
        nombre: '',
        estado: true
    };

    // Permisos
    canWrite = false;
    canDelete = false;

    constructor(
        private departamentoService: DepartamentoService,
        private paisService: PaisService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        // Cargar permisos para esta ruta
        const currentRoute = '/finanzas/mantenimientos/departamentos';
        this.canWrite = this.permissionService.canWrite(currentRoute);
        this.canDelete = this.permissionService.canDelete(currentRoute);

        this.cargarDatos();
        this.cargarPaises();
    }

    cargarDatos() {
        this.loading = true;

        this.departamentoService.getAll().subscribe({
            next: (departamentos) => {
                this.departamentos = departamentos || [];
                this.aplicarFiltros();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                console.error('Error cargando departamentos:', error);
                this.loading = false;
                this.cdr.detectChanges();
                Swal.fire('Error', 'Error al cargar los departamentos', 'error');
            }
        });
    }

    cargarPaises() {
        this.paisService.getAll().subscribe({
            next: (paises) => {
                this.paises = paises || [];
            },
            error: (error: any) => {
                console.error('Error cargando países:', error);
            }
        });
    }

    aplicarFiltros() {
        // Filtrar por búsqueda
        if (this.searchTerm.trim() === '') {
            this.departamentosFiltrados = [...this.departamentos];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.departamentosFiltrados = this.departamentos.filter(d =>
                d.nombre.toLowerCase().includes(term) ||
                (d.pais && d.pais.nombre.toLowerCase().includes(term))
            );
        }

        // Calcular paginación
        this.totalPages = Math.ceil(this.departamentosFiltrados.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = 1;
        }

        // Calcular páginas visibles (paginación inteligente)
        this.pages = this.calcularPaginasVisibles();

        // Calcular departamentos paginados
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
        this.departamentosPaginados = this.departamentosFiltrados.slice(start, end);
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
        this.currentDepartamentoId = null;
        this.formData = {
            id_pais: 0,
            nombre: '',
            estado: true
        };
        this.showForm = true;
    }

    abrirFormularioEditar(departamento: Departamento) {
        this.isEditing = true;
        this.currentDepartamentoId = departamento.id_departamento;
        this.formData = {
            id_pais: departamento.id_pais,
            nombre: departamento.nombre,
            estado: departamento.estado !== undefined ? departamento.estado : true
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.currentDepartamentoId = null;
    }

    guardarDepartamento() {
        // Validaciones
        if (!this.formData.id_pais || this.formData.id_pais === 0) {
            Swal.fire('Error', 'Debe seleccionar un país', 'warning');
            return;
        }

        if (!this.formData.nombre || this.formData.nombre.trim() === '') {
            Swal.fire('Error', 'El nombre del departamento es requerido', 'warning');
            return;
        }

        if (this.formData.nombre.length > 150) {
            Swal.fire('Error', 'El nombre no puede exceder 150 caracteres', 'warning');
            return;
        }

        if (this.isEditing && this.currentDepartamentoId) {
            // Actualizar
            this.departamentoService.update(this.currentDepartamentoId, this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Departamento actualizado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error actualizando departamento:', error);
                    Swal.fire('Error', error.error?.message || 'Error al actualizar el departamento', 'error');
                }
            });
        } else {
            // Crear
            this.departamentoService.create(this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Departamento creado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error creando departamento:', error);
                    Swal.fire('Error', error.error?.message || 'Error al crear el departamento', 'error');
                }
            });
        }
    }

    eliminarDepartamento(departamento: Departamento) {
        Swal.fire({
            title: '¿Eliminar Departamento?',
            text: `¿Estás seguro de eliminar "${departamento.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.departamentoService.delete(departamento.id_departamento).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Departamento eliminado correctamente', 'success');
                        this.cargarDatos();
                    },
                    error: (error: any) => {
                        console.error('Error eliminando departamento:', error);
                        Swal.fire('Error', 'Error al eliminar el departamento', 'error');
                    }
                });
            }
        });
    }
}
