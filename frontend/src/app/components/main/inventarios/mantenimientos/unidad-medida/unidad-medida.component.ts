import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnidadMedidaService, UnidadMedida, CreateUnidadMedidaDto } from '../../../../../services/unidad-medida.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-unidad-medida',
    imports: [CommonModule, FormsModule],
    templateUrl: './unidad-medida.component.html',
    styleUrl: './unidad-medida.component.css',
})
export class UnidadMedidaComponent implements OnInit {
    unidades: UnidadMedida[] = [];
    unidadesFiltradas: UnidadMedida[] = [];
    unidadesPaginadas: UnidadMedida[] = [];
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

    formData: CreateUnidadMedidaDto = {
        nombre: '',
        simbolo: '',
        factor_conversion: 1,
        codigo_iso: '',
        es_base: false,
        estado: true
    };

    // Permisos
    canWrite = false;
    canDelete = false;

    constructor(
        private unidadMedidaService: UnidadMedidaService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.canWrite = this.permissionService.canWrite('/inventarios/mantenimientos/unidades-medidas');
        this.canDelete = this.permissionService.canDelete('/inventarios/mantenimientos/unidades-medidas');
        this.cargarDatos();
    }

    cargarDatos() {
        this.loading = true;
        this.unidadMedidaService.getAll().subscribe({
            next: (data) => {
                this.unidades = data || [];
                this.aplicarFiltros();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error cargando unidades:', error);
                this.loading = false;
                this.cdr.detectChanges();
                Swal.fire('Error', 'Error al cargar las unidades de medida', 'error');
            }
        });
    }

    aplicarFiltros() {
        if (this.searchTerm.trim() === '') {
            this.unidadesFiltradas = [...this.unidades];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.unidadesFiltradas = this.unidades.filter(u =>
                u.nombre.toLowerCase().includes(term) ||
                u.simbolo.toLowerCase().includes(term)
            );
        }

        this.totalPages = Math.ceil(this.unidadesFiltradas.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = 1;
        }
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.calcularPaginacion();
    }

    calcularPaginacion() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.unidadesPaginadas = this.unidadesFiltradas.slice(start, end);
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
        this.currentId = null;
        this.formData = {
            nombre: '',
            simbolo: '',
            factor_conversion: 1,
            codigo_iso: '',
            es_base: false,
            estado: true
        };
        this.showForm = true;
    }

    abrirFormularioEditar(unidad: UnidadMedida) {
        this.isEditing = true;
        this.currentId = unidad.id_unidad_medida;
        this.formData = {
            nombre: unidad.nombre,
            simbolo: unidad.simbolo,
            factor_conversion: unidad.factor_conversion,
            codigo_iso: unidad.codigo_iso,
            es_base: unidad.es_base,
            estado: unidad.estado
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.currentId = null;
    }

    guardar() {
        if (!this.formData.nombre || !this.formData.simbolo) {
            Swal.fire('Atención', 'Nombre y Símbolo son requeridos', 'warning');
            return;
        }

        // Limpiar y preparar los datos
        const dataToSend: any = {
            nombre: this.formData.nombre.trim(),
            simbolo: this.formData.simbolo.trim(),
            factor_conversion: Number(this.formData.factor_conversion),
            es_base: Boolean(this.formData.es_base),
            estado: Boolean(this.formData.estado)
        };

        // Solo incluir codigo_iso si tiene valor
        if (this.formData.codigo_iso && this.formData.codigo_iso.trim() !== '') {
            dataToSend.codigo_iso = this.formData.codigo_iso.trim();
        }

        if (this.isEditing && this.currentId) {
            this.unidadMedidaService.update(this.currentId, dataToSend).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Actualizado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (err) => {
                    console.error(err);
                    Swal.fire('Error', err.error?.message || 'No se pudo actualizar', 'error');
                }
            });
        } else {
            this.unidadMedidaService.create(dataToSend).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Creado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (err) => {
                    console.error(err);
                    Swal.fire('Error', err.error?.message || 'No se pudo crear', 'error');
                }
            });
        }
    }

    eliminar(unidad: UnidadMedida) {
        Swal.fire({
            title: '¿Eliminar?',
            text: `¿Seguro de eliminar "${unidad.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.unidadMedidaService.delete(unidad.id_unidad_medida).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Registro eliminado', 'success');
                        this.cargarDatos();
                    },
                    error: (err) => {
                        console.error(err);
                        Swal.fire('Error', 'No se pudo eliminar', 'error');
                    }
                });
            }
        });
    }
}
