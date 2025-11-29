import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tipo_articuloService, Tipo_articulo, CreateTipo_articuloDto, UpdateTipo_articuloDto } from '../../../../../services/tipo_articulo.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-tipo-articulo',
    imports: [CommonModule, FormsModule],
    templateUrl: './tipo_articulo.component.html',
    styleUrl: './tipo_articulo.component.css',
})
export class TipoArticuloComponent implements OnInit {
    tipoArticulos: Tipo_articulo[] = [];
    tipoArticulosFiltrados: Tipo_articulo[] = [];
    tipoArticulosPaginados: Tipo_articulo[] = [];
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
    currentTipoArticuloId: number | null = null;

    formData: CreateTipo_articuloDto = {
        nombre: ''
    };

    // Permisos
    canWrite = false;
    canDelete = false;

    constructor(
        private tipoArticuloService: Tipo_articuloService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        // Cargar permisos para esta ruta
        this.canWrite = this.permissionService.canWrite('/inventarios/mantenimientos/tipos-articulos');
        this.canDelete = this.permissionService.canDelete('/inventarios/mantenimientos/tipos-articulos');

        this.cargarDatos();
    }

    cargarDatos() {
        this.loading = true;

        this.tipoArticuloService.getAll().subscribe({
            next: (tipoArticulos) => {
                this.tipoArticulos = tipoArticulos || [];
                this.aplicarFiltros();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                console.error('Error cargando tipos de artículo:', error);
                this.loading = false;
                this.cdr.detectChanges();
                Swal.fire('Error', 'Error al cargar los tipos de artículo', 'error');
            }
        });
    }

    aplicarFiltros() {
        // Filtrar por búsqueda
        if (this.searchTerm.trim() === '') {
            this.tipoArticulosFiltrados = [...this.tipoArticulos];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.tipoArticulosFiltrados = this.tipoArticulos.filter(r =>
                r.nombre.toLowerCase().includes(term)
            );
        }

        // Calcular paginación
        this.totalPages = Math.ceil(this.tipoArticulosFiltrados.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = 1;
        }

        // Calcular páginas
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

        // Calcular paginados
        this.calcularPaginacion();
    }

    calcularPaginacion() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.tipoArticulosPaginados = this.tipoArticulosFiltrados.slice(start, end);
    }

    onSearch() {
        this.currentPage = 1;
        this.aplicarFiltros();
    }

    cambiarPagina(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.calcularPaginacion();
        }
    }

    abrirFormularioNuevo() {
        this.isEditing = false;
        this.currentTipoArticuloId = null;
        this.formData = {
            nombre: ''
        };
        this.showForm = true;
    }

    abrirFormularioEditar(tipoArticulo: Tipo_articulo) {
        this.isEditing = true;
        this.currentTipoArticuloId = tipoArticulo.id_tipo_articulo;
        this.formData = {
            nombre: tipoArticulo.nombre
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.currentTipoArticuloId = null;
    }

    guardarTipoArticulo() {
        // Validaciones
        if (!this.formData.nombre || this.formData.nombre.trim() === '') {
            Swal.fire('Error', 'El nombre del Tipo de Artículo es requerido', 'warning');
            return;
        }

        if (this.formData.nombre.length > 150) {
            Swal.fire('Error', 'El nombre no puede exceder 150 caracteres', 'warning');
            return;
        }

        if (this.isEditing && this.currentTipoArticuloId) {
            // Actualizar
            this.tipoArticuloService.update(this.currentTipoArticuloId, this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Tipo de Artículo actualizado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error actualizando Tipo de Artículo:', error);
                    Swal.fire('Error', error.error?.message || 'Error al actualizar el Tipo de Artículo', 'error');
                }
            });
        } else {
            // Crear
            this.tipoArticuloService.create(this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Tipo de Artículo creado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error creando Tipo de Artículo:', error);
                    Swal.fire('Error', error.error?.message || 'Error al crear el Tipo de Artículo', 'error');
                }
            });
        }
    }

    eliminarTipoArticulo(tipoArticulo: Tipo_articulo) {
        Swal.fire({
            title: '¿Eliminar Tipo de Artículo?',
            text: `¿Estás seguro de eliminar "${tipoArticulo.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.tipoArticuloService.delete(tipoArticulo.id_tipo_articulo).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Tipo de Artículo eliminado correctamente', 'success');
                        this.cargarDatos();
                    },
                    error: (error: any) => {
                        console.error('Error eliminando Tipo de Artículo:', error);
                        Swal.fire('Error', 'Error al eliminar el Tipo de Artículo', 'error');
                    }
                });
            }
        });
    }
}
