import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConceptoService, Concepto, CreateConceptoDto } from '../../../../../services/concepto.service';
import { CuentaContableService, CuentaContable } from '../../../../../services/cuenta-contable.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-concepto',
    imports: [CommonModule, FormsModule],
    templateUrl: './concepto.component.html',
    styleUrl: './concepto.component.css',
})
export class ConceptoComponent implements OnInit {
    conceptos: Concepto[] = [];
    conceptosFiltrados: Concepto[] = [];
    conceptosPaginados: Concepto[] = [];
    cuentasContables: CuentaContable[] = [];
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
    currentConceptoId: number | null = null;

    formData: CreateConceptoDto = {
        descripcion: '',
        tipo_concepto: 'D',
        id_cuenta_contable: 0,
        estado: true
    };

    // Permisos
    canWrite = false;
    canDelete = false;

    constructor(
        private conceptoService: ConceptoService,
        private cuentaContableService: CuentaContableService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        // Cargar permisos
        this.canWrite = this.permissionService.canWrite('/finanzas/mantenimientos/conceptos');
        this.canDelete = this.permissionService.canDelete('/finanzas/mantenimientos/conceptos');

        this.cargarCuentas();
        this.cargarDatos();
    }

    cargarCuentas() {
        this.cuentaContableService.getAll().subscribe({
            next: (cuentas) => {
                // Cargar todas las cuentas activas (sin restricción de nivel por ahora)
                this.cuentasContables = cuentas.filter(c => c.estado === true) || [];
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                console.error('Error cargando cuentas contables:', error);
            }
        });
    }

    cargarDatos() {
        this.loading = true;
        this.conceptoService.getAll().subscribe({
            next: (conceptos) => {
                this.conceptos = conceptos || [];
                this.aplicarFiltros();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                console.error('Error cargando conceptos:', error);
                this.loading = false;
                Swal.fire('Error', 'Error al cargar los conceptos', 'error');
            }
        });
    }

    aplicarFiltros() {
        if (this.searchTerm.trim() === '') {
            this.conceptosFiltrados = [...this.conceptos];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.conceptosFiltrados = this.conceptos.filter(c =>
                c.descripcion.toLowerCase().includes(term) ||
                (c.cuenta_contable?.numero_cuenta && c.cuenta_contable.numero_cuenta.includes(term)) ||
                (c.cuenta_contable?.descripcion && c.cuenta_contable.descripcion.toLowerCase().includes(term))
            );
        }

        this.totalPages = Math.ceil(this.conceptosFiltrados.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = 1;
        }
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.calcularPaginacion();
    }

    calcularPaginacion() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.conceptosPaginados = this.conceptosFiltrados.slice(start, end);
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
        this.currentConceptoId = null;
        this.formData = {
            descripcion: '',
            tipo_concepto: 'D',
            id_cuenta_contable: 0,
            estado: true
        };
        this.showForm = true;
    }

    abrirFormularioEditar(concepto: Concepto) {
        this.isEditing = true;
        this.currentConceptoId = concepto.id_concepto;
        this.formData = {
            descripcion: concepto.descripcion,
            tipo_concepto: concepto.tipo_concepto,
            id_cuenta_contable: concepto.id_cuenta_contable || 0,
            estado: concepto.estado !== undefined ? concepto.estado : true
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.currentConceptoId = null;
    }

    guardarConcepto() {
        if (!this.formData.descripcion || this.formData.descripcion.trim() === '') {
            Swal.fire('Error', 'La descripción es requerida', 'warning');
            return;
        }

        // Asegurar tipos numéricos y string, enviando null si id_cuenta_contable es 0
        const dataToSend: any = {
            ...this.formData,
            tipo_concepto: this.formData.tipo_concepto, // 'D' o 'C'
            id_cuenta_contable: (this.formData.id_cuenta_contable && Number(this.formData.id_cuenta_contable) !== 0)
                ? Number(this.formData.id_cuenta_contable)
                : null
        };

        // NOTA: No eliminamos la propiedad si es null, porque queremos enviar null explícitamente
        // para que Prisma sepa que debe desvincular la cuenta (setear a NULL en DB).
        if (this.isEditing && this.currentConceptoId) {
            this.conceptoService.update(this.currentConceptoId, dataToSend).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Concepto actualizado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error actualizando concepto:', error);
                    const msg = error.error?.message ? (Array.isArray(error.error.message) ? error.error.message.join(', ') : error.error.message) : 'Error al actualizar';
                    Swal.fire('Error', msg, 'error');
                }
            });
        } else {
            this.conceptoService.create(dataToSend).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Concepto creado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error creando concepto:', error);
                    const msg = error.error?.message ? (Array.isArray(error.error.message) ? error.error.message.join(', ') : error.error.message) : 'Error al crear';
                    Swal.fire('Error', msg, 'error');
                }
            });
        }
    }

    eliminarConcepto(concepto: Concepto) {
        Swal.fire({
            title: '¿Eliminar Concepto?',
            text: `¿Estás seguro de eliminar el concepto "${concepto.descripcion}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.conceptoService.delete(concepto.id_concepto).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Concepto eliminado correctamente', 'success');
                        this.cargarDatos();
                    },
                    error: (error: any) => {
                        console.error('Error eliminando concepto:', error);
                        Swal.fire('Error', 'Error al eliminar el concepto', 'error');
                    }
                });
            }
        });
    }
}
