import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TipoTransaccionService, TipoTransaccion, CreateTipoTransaccionDto } from '../../../../../services/tipo-transaccion.service';
import { ClaseDocumentoService, ClaseDocumento } from '../../../../../services/clase-documento.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-tipo-transaccion',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './tipo-transaccion.component.html',
    styleUrls: ['./tipo-transaccion.component.css']
})
export class TipoTransaccionComponent implements OnInit {
    tiposTransaccion: TipoTransaccion[] = [];
    tiposFiltrados: TipoTransaccion[] = [];
    tiposPaginados: TipoTransaccion[] = [];
    clasesDocumento: ClaseDocumento[] = [];
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
    currentId: number | null = null;

    formData: CreateTipoTransaccionDto = {
        id_clase_documento: 0,
        nombre: '',
        abreviacion: '',
        descripcion: '',
        tipo: 'D',
        maneja_iva: true,
        origen: 'E',
        estado: true
    };

    // Permisos
    canWrite = false;
    canDelete = false;

    constructor(
        private tipoTransaccionService: TipoTransaccionService,
        private claseService: ClaseDocumentoService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        const currentRoute = '/sistemas/administracion/tipos-transacciones';
        this.canWrite = this.permissionService.canWrite(currentRoute);
        this.canDelete = this.permissionService.canDelete(currentRoute);

        this.cargarDatos();
        this.cargarClasesDocumento();
    }

    cargarDatos() {
        this.loading = true;
        this.tipoTransaccionService.getAll().subscribe({
            next: (data: TipoTransaccion[]) => {
                this.tiposTransaccion = data || [];
                this.aplicarFiltros();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                console.error('Error cargando tipos de transacción:', error);
                this.loading = false;
                this.cdr.detectChanges();
                Swal.fire('Error', 'Error al cargar los tipos de transacción', 'error');
            }
        });
    }

    cargarClasesDocumento() {
        this.claseService.getAll().subscribe({
            next: (data: ClaseDocumento[]) => {
                this.clasesDocumento = data || [];
            },
            error: (error: any) => {
                console.error('Error cargando clases de documento:', error);
            }
        });
    }

    aplicarFiltros() {
        if (this.searchTerm.trim() === '') {
            this.tiposFiltrados = [...this.tiposTransaccion];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.tiposFiltrados = this.tiposTransaccion.filter(t =>
                t.nombre.toLowerCase().includes(term) ||
                t.abreviacion?.toLowerCase().includes(term) ||
                t.clase_documento?.nombre.toLowerCase().includes(term)
            );
        }

        this.totalPages = Math.ceil(this.tiposFiltrados.length / this.itemsPerPage);
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
        this.tiposPaginados = this.tiposFiltrados.slice(start, end);
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
        this.currentId = null;
        this.formData = {
            id_clase_documento: 0,
            nombre: '',
            abreviacion: '',
            descripcion: '',
            tipo: 'D',
            maneja_iva: true,
            origen: 'E',
            estado: true
        };
        this.showForm = true;
    }

    abrirFormularioEditar(item: TipoTransaccion) {
        this.isEditing = true;
        this.currentId = item.id_tipo_transaccion;
        this.formData = {
            id_clase_documento: item.id_clase_documento,
            nombre: item.nombre,
            abreviacion: item.abreviacion || '',
            descripcion: item.descripcion || '',
            tipo: item.tipo,
            maneja_iva: item.maneja_iva,
            origen: item.origen,
            estado: item.estado
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.currentId = null;
    }

    guardar() {
        if (!this.formData.nombre || this.formData.nombre.trim() === '') {
            Swal.fire('Error', 'El nombre es requerido', 'warning');
            return;
        }
        if (!this.formData.id_clase_documento || this.formData.id_clase_documento === 0) {
            Swal.fire('Error', 'Debe seleccionar una clase de documento', 'warning');
            return;
        }

        // Convertir id_clase_documento a número por si viene como string del select
        this.formData.id_clase_documento = Number(this.formData.id_clase_documento);

        if (this.isEditing && this.currentId) {
            this.tipoTransaccionService.update(this.currentId, this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Tipo de transacción actualizado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error actualizando:', error);
                    Swal.fire('Error', error.error?.message || 'Error al actualizar', 'error');
                }
            });
        } else {
            this.tipoTransaccionService.create(this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Tipo de transacción creado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error creando:', error);
                    Swal.fire('Error', error.error?.message || 'Error al crear', 'error');
                }
            });
        }
    }

    eliminar(item: TipoTransaccion) {
        Swal.fire({
            title: '¿Eliminar?',
            text: `¿Estás seguro de eliminar "${item.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.tipoTransaccionService.delete(item.id_tipo_transaccion).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Registro eliminado correctamente', 'success');
                        this.cargarDatos();
                    },
                    error: (error: any) => {
                        console.error('Error eliminando:', error);
                        Swal.fire('Error', 'Error al eliminar', 'error');
                    }
                });
            }
        });
    }
}
