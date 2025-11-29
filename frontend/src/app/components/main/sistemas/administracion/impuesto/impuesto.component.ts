import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImpuestoService, Impuesto, CreateImpuestoDto, UpdateImpuestoDto } from '../../../../../services/impuesto.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-impuesto',
    imports: [CommonModule, FormsModule],
    templateUrl: './impuesto.component.html',
    styleUrl: './impuesto.component.css',
})
export class ImpuestoComponent implements OnInit {
    impuestos: Impuesto[] = [];
    impuestosFiltrados: Impuesto[] = [];
    impuestosPaginados: Impuesto[] = [];
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
    currentImpuestoId: number | null = null;

    formData: CreateImpuestoDto = {
        nombre: '',
        abreviacion: '',
        valor_calculo: 0,
        estado: true
    };

    // Permisos
    canWrite = false;
    canDelete = false;

    constructor(
        private impuestoService: ImpuestoService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        // Cargar permisos para esta ruta
        this.canWrite = this.permissionService.canWrite('/sistemas/administracion/impuestos');
        this.canDelete = this.permissionService.canDelete('/sistemas/administracion/impuestos');

        this.cargarDatos();
    }

    cargarDatos() {
        this.loading = true;

        this.impuestoService.getAll().toPromise().then((impuestos: Impuesto[] | undefined) => {
            this.impuestos = impuestos || [];
            this.aplicarFiltros();
            this.loading = false;
            this.cdr.detectChanges();
        }).catch((error: any) => {
            console.error('Error cargando impuestos:', error);
            this.loading = false;
            this.cdr.detectChanges();
            Swal.fire('Error', 'Error al cargar los impuestos', 'error');
        });
    }

    aplicarFiltros() {
        // Filtrar por búsqueda
        if (this.searchTerm.trim() === '') {
            this.impuestosFiltrados = [...this.impuestos];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.impuestosFiltrados = this.impuestos.filter(i =>
                i.nombre.toLowerCase().includes(term) ||
                i.abreviacion.toLowerCase().includes(term)
            );
        }

        // Calcular paginación
        this.totalPages = Math.ceil(this.impuestosFiltrados.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = 1;
        }

        // Calcular páginas
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

        // Calcular impuestos paginados
        this.calcularPaginacion();
    }

    calcularPaginacion() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.impuestosPaginados = this.impuestosFiltrados.slice(start, end);
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
        this.currentImpuestoId = null;
        this.formData = {
            nombre: '',
            abreviacion: '',
            valor_calculo: 0,
            estado: true
        };
        this.showForm = true;
    }

    abrirFormularioEditar(impuesto: Impuesto) {
        this.isEditing = true;
        this.currentImpuestoId = impuesto.id_impuesto;
        this.formData = {
            nombre: impuesto.nombre,
            abreviacion: impuesto.abreviacion,
            valor_calculo: impuesto.valor_calculo,
            estado: impuesto.estado
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.currentImpuestoId = null;
    }

    guardarImpuesto() {
        // Validaciones
        if (!this.formData.nombre || this.formData.nombre.trim() === '') {
            Swal.fire('Error', 'El nombre del impuesto es requerido', 'warning');
            return;
        }

        if (this.formData.nombre.length > 150) {
            Swal.fire('Error', 'El nombre no puede exceder 150 caracteres', 'warning');
            return;
        }

        if (!this.formData.abreviacion || this.formData.abreviacion.trim() === '') {
            Swal.fire('Error', 'La abreviación es requerida', 'warning');
            return;
        }

        if (this.formData.abreviacion.length > 50) {
            Swal.fire('Error', 'La abreviación no puede exceder 50 caracteres', 'warning');
            return;
        }

        if (this.formData.valor_calculo === null || this.formData.valor_calculo === undefined) {
            Swal.fire('Error', 'El valor de cálculo es requerido', 'warning');
            return;
        }

        // Asegurar que valor_calculo sea un número
        this.formData.valor_calculo = Number(this.formData.valor_calculo);

        if (this.isEditing && this.currentImpuestoId) {
            // Actualizar
            this.impuestoService.update(this.currentImpuestoId, this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Impuesto actualizado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error actualizando impuesto:', error);
                    const errorMessage = Array.isArray(error.error?.message)
                        ? error.error.message.join(', ')
                        : (error.error?.message || 'Error al actualizar el impuesto');
                    Swal.fire('Error', errorMessage, 'error');
                }
            });
        } else {
            // Crear
            this.impuestoService.create(this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Impuesto creado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error creando impuesto:', error);
                    const errorMessage = Array.isArray(error.error?.message)
                        ? error.error.message.join(', ')
                        : (error.error?.message || 'Error al crear el impuesto');
                    Swal.fire('Error', errorMessage, 'error');
                }
            });
        }
    }

    eliminarImpuesto(impuesto: Impuesto) {
        Swal.fire({
            title: '¿Eliminar impuesto?',
            text: `¿Estás seguro de eliminar "${impuesto.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.impuestoService.delete(impuesto.id_impuesto).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Impuesto eliminado correctamente', 'success');
                        this.cargarDatos();
                    },
                    error: (error: any) => {
                        console.error('Error eliminando impuesto:', error);
                        Swal.fire('Error', 'Error al eliminar el impuesto', 'error');
                    }
                });
            }
        });
    }
}
