import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CiudadService, Ciudad, CreateCiudadDto } from '../../../../../services/ciudad.service';
import { DepartamentoService, Departamento } from '../../../../../services/departamento.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-ciudad',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './ciudad.component.html',
    styleUrls: ['./ciudad.component.css']
})
export class CiudadComponent implements OnInit {
    ciudades: Ciudad[] = [];
    ciudadesFiltradas: Ciudad[] = [];
    ciudadesPaginadas: Ciudad[] = [];
    departamentos: Departamento[] = [];
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
    currentCiudadId: number | null = null;

    formData: CreateCiudadDto = {
        id_departamento: 0,
        nombre: '',
        estado: true
    };

    // Permisos
    canWrite = false;
    canDelete = false;

    constructor(
        private ciudadService: CiudadService,
        private departamentoService: DepartamentoService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        // Cargar permisos para esta ruta
        const currentRoute = '/finanzas/mantenimientos/ciudades';
        this.canWrite = this.permissionService.canWrite(currentRoute);
        this.canDelete = this.permissionService.canDelete(currentRoute);

        this.cargarDatos();
        this.cargarDepartamentos();
    }

    cargarDatos() {
        this.loading = true;

        this.ciudadService.getAll().subscribe({
            next: (ciudades) => {
                this.ciudades = ciudades || [];
                this.aplicarFiltros();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                console.error('Error cargando ciudades:', error);
                this.loading = false;
                this.cdr.detectChanges();
                Swal.fire('Error', 'Error al cargar las ciudades', 'error');
            }
        });
    }

    cargarDepartamentos() {
        this.departamentoService.getAll().subscribe({
            next: (departamentos) => {
                this.departamentos = departamentos.filter(d => d.estado) || [];
            },
            error: (error: any) => {
                console.error('Error cargando departamentos:', error);
            }
        });
    }

    aplicarFiltros() {
        // Filtrar por búsqueda
        if (this.searchTerm.trim() === '') {
            this.ciudadesFiltradas = [...this.ciudades];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.ciudadesFiltradas = this.ciudades.filter(c =>
                c.nombre.toLowerCase().includes(term) ||
                (c.departamento && c.departamento.nombre.toLowerCase().includes(term))
            );
        }

        // Calcular paginación
        this.totalPages = Math.ceil(this.ciudadesFiltradas.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = 1;
        }

        // Calcular páginas visibles (paginación inteligente)
        this.pages = this.calcularPaginasVisibles();

        // Calcular ciudades paginadas
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
        this.ciudadesPaginadas = this.ciudadesFiltradas.slice(start, end);
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
        this.currentCiudadId = null;
        this.formData = {
            id_departamento: 0,
            nombre: '',
            estado: true
        };
        this.showForm = true;
    }

    abrirFormularioEditar(ciudad: Ciudad) {
        this.isEditing = true;
        this.currentCiudadId = ciudad.id_ciudad;
        this.formData = {
            id_departamento: ciudad.id_departamento,
            nombre: ciudad.nombre,
            estado: ciudad.estado !== undefined ? ciudad.estado : true
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.currentCiudadId = null;
    }

    guardarCiudad() {
        // Validaciones
        if (!this.formData.id_departamento || this.formData.id_departamento === 0) {
            Swal.fire('Error', 'Debe seleccionar un departamento', 'warning');
            return;
        }

        if (!this.formData.nombre || this.formData.nombre.trim() === '') {
            Swal.fire('Error', 'El nombre de la ciudad es requerido', 'warning');
            return;
        }

        if (this.formData.nombre.length > 150) {
            Swal.fire('Error', 'El nombre no puede exceder 150 caracteres', 'warning');
            return;
        }

        if (this.isEditing && this.currentCiudadId) {
            // Actualizar
            this.ciudadService.update(this.currentCiudadId, this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Ciudad actualizada correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error actualizando ciudad:', error);
                    Swal.fire('Error', error.error?.message || 'Error al actualizar la ciudad', 'error');
                }
            });
        } else {
            // Crear
            this.ciudadService.create(this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Ciudad creada correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error creando ciudad:', error);
                    Swal.fire('Error', error.error?.message || 'Error al crear la ciudad', 'error');
                }
            });
        }
    }

    eliminarCiudad(ciudad: Ciudad) {
        Swal.fire({
            title: '¿Eliminar Ciudad?',
            text: `¿Estás seguro de eliminar "${ciudad.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.ciudadService.delete(ciudad.id_ciudad).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Ciudad eliminada correctamente', 'success');
                        this.cargarDatos();
                    },
                    error: (error: any) => {
                        console.error('Error eliminando ciudad:', error);
                        Swal.fire('Error', 'Error al eliminar la ciudad', 'error');
                    }
                });
            }
        });
    }
}
