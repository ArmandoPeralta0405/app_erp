import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaseDocumentoService, ClaseDocumento, CreateClaseDocumentoDto } from '../../../../../services/clase-documento.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-clase-documento',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './clase-documento.component.html',
    styleUrls: ['./clase-documento.component.css']
})
export class ClaseDocumentoComponent implements OnInit {
    clases: ClaseDocumento[] = [];
    clasesFiltradas: ClaseDocumento[] = [];
    clasesPaginadas: ClaseDocumento[] = [];
    loading = true;

    // Búsqueda
    searchTerm = '';

    // Paginación
    currentPage = 1;
    itemsPerPage = 10;
    totalPages = 1;
    pages: number[] = [];

    // Formulario
    showForm = false;
    isEditing = false;
    currentClaseId: number | null = null;

    formData: CreateClaseDocumentoDto = {
        nombre: ''
    };

    // Permisos
    canWrite = false;
    canDelete = false;

    constructor(
        private claseService: ClaseDocumentoService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        const currentRoute = '/sistemas/administracion/clases-documentos';
        this.canWrite = this.permissionService.canWrite(currentRoute);
        this.canDelete = this.permissionService.canDelete(currentRoute);

        this.cargarDatos();
    }

    cargarDatos() {
        this.loading = true;
        this.claseService.getAll().subscribe({
            next: (clases: ClaseDocumento[]) => {
                this.clases = clases || [];
                this.aplicarFiltros();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                console.error('Error cargando clases de documento:', error);
                this.loading = false;
                this.cdr.detectChanges();
                Swal.fire('Error', 'Error al cargar las clases de documento', 'error');
            }
        });
    }

    aplicarFiltros() {
        if (this.searchTerm.trim() === '') {
            this.clasesFiltradas = [...this.clases];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.clasesFiltradas = this.clases.filter(c =>
                c.nombre.toLowerCase().includes(term)
            );
        }

        this.totalPages = Math.ceil(this.clasesFiltradas.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = 1;
        }

        this.pages = this.calcularPaginasVisibles();
        this.calcularPaginacion();
    }

    calcularPaginasVisibles(): number[] {
        const maxPagesToShow = 5;
        const pages: number[] = [];

        if (this.totalPages <= maxPagesToShow + 2) {
            return Array.from({ length: this.totalPages }, (_, i) => i + 1);
        }

        pages.push(1);

        let startPage = Math.max(2, this.currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);

        if (endPage === this.totalPages - 1) {
            startPage = Math.max(2, endPage - maxPagesToShow + 1);
        }

        if (startPage > 2) {
            pages.push(-1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < this.totalPages - 1) {
            pages.push(-1);
        }

        if (this.totalPages > 1) {
            pages.push(this.totalPages);
        }

        return pages;
    }

    calcularPaginacion() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.clasesPaginadas = this.clasesFiltradas.slice(start, end);
    }

    onSearch() {
        this.currentPage = 1;
        this.aplicarFiltros();
    }

    cambiarPagina(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.pages = this.calcularPaginasVisibles();
            this.calcularPaginacion();
        }
    }

    abrirFormularioNuevo() {
        this.isEditing = false;
        this.currentClaseId = null;
        this.formData = {
            nombre: ''
        };
        this.showForm = true;
    }

    abrirFormularioEditar(clase: ClaseDocumento) {
        this.isEditing = true;
        this.currentClaseId = clase.id_clase_documento;
        this.formData = {
            nombre: clase.nombre
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.currentClaseId = null;
    }

    guardarClase() {
        if (!this.formData.nombre || this.formData.nombre.trim() === '') {
            Swal.fire('Error', 'El nombre es requerido', 'warning');
            return;
        }

        if (this.isEditing && this.currentClaseId) {
            this.claseService.update(this.currentClaseId, this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Clase de documento actualizada correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error actualizando clase:', error);
                    Swal.fire('Error', error.error?.message || 'Error al actualizar la clase', 'error');
                }
            });
        } else {
            this.claseService.create(this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Clase de documento creada correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error creando clase:', error);
                    Swal.fire('Error', error.error?.message || 'Error al crear la clase', 'error');
                }
            });
        }
    }

    eliminarClase(clase: ClaseDocumento) {
        Swal.fire({
            title: '¿Eliminar Clase?',
            text: `¿Estás seguro de eliminar "${clase.nombre}"? Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.claseService.delete(clase.id_clase_documento).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Clase eliminada correctamente', 'success');
                        this.cargarDatos();
                    },
                    error: (error: any) => {
                        console.error('Error eliminando clase:', error);
                        Swal.fire('Error', 'Error al eliminar la clase', 'error');
                    }
                });
            }
        });
    }
}
