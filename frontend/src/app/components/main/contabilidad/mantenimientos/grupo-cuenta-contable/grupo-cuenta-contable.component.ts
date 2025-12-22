import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GrupoCuentaContableService, GrupoCuentaContable, CreateGrupoCuentaContableDto, UpdateGrupoCuentaContableDto } from '../../../../../services/grupo-cuenta-contable.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-grupo-cuenta-contable',
    imports: [CommonModule, FormsModule],
    templateUrl: './grupo-cuenta-contable.component.html',
    styleUrl: './grupo-cuenta-contable.component.css',
})
export class GrupoCuentaContableComponent implements OnInit {
    gruposCuentaContable: GrupoCuentaContable[] = [];
    gruposFiltrados: GrupoCuentaContable[] = [];
    gruposPaginados: GrupoCuentaContable[] = [];
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
    currentGrupoId: number | null = null;

    formData: CreateGrupoCuentaContableDto = {
        nombre: '',
        codigo: '',
        descripcion: ''
    };

    // Permisos
    canWrite = false;
    canDelete = false;

    constructor(
        private grupoCuentaContableService: GrupoCuentaContableService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        // Cargar permisos para esta ruta
        this.canWrite = this.permissionService.canWrite('/contabilidad/mantenimientos/grupos-cuenta-contable');
        this.canDelete = this.permissionService.canDelete('/contabilidad/mantenimientos/grupos-cuenta-contable');

        this.cargarDatos();
    }

    cargarDatos() {
        this.loading = true;

        this.grupoCuentaContableService.getAll().subscribe({
            next: (grupos) => {
                this.gruposCuentaContable = grupos || [];
                this.aplicarFiltros();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                console.error('Error cargando grupos de cuenta contable:', error);
                this.loading = false;
                this.cdr.detectChanges();
                Swal.fire('Error', 'Error al cargar los grupos de cuenta contable', 'error');
            }
        });
    }

    aplicarFiltros() {
        // Filtrar por búsqueda
        if (this.searchTerm.trim() === '') {
            this.gruposFiltrados = [...this.gruposCuentaContable];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.gruposFiltrados = this.gruposCuentaContable.filter(g =>
                g.nombre.toLowerCase().includes(term) ||
                g.codigo.toLowerCase().includes(term) ||
                (g.descripcion && g.descripcion.toLowerCase().includes(term))
            );
        }

        // Calcular paginación
        this.totalPages = Math.ceil(this.gruposFiltrados.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = 1;
        }

        // Calcular páginas
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

        // Calcular grupos paginados
        this.calcularPaginacion();
    }

    calcularPaginacion() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.gruposPaginados = this.gruposFiltrados.slice(start, end);
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
        this.currentGrupoId = null;
        this.formData = {
            nombre: '',
            codigo: '',
            descripcion: '',
            estado: true  // Por defecto activo
        };
        this.showForm = true;
    }

    abrirFormularioEditar(grupo: GrupoCuentaContable) {
        this.isEditing = true;
        this.currentGrupoId = grupo.id_grupo_cuenta_contable;
        this.formData = {
            nombre: grupo.nombre,
            codigo: grupo.codigo,
            descripcion: grupo.descripcion || '',
            estado: grupo.estado !== undefined ? grupo.estado : true
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.currentGrupoId = null;
    }

    guardarGrupo() {
        // Validaciones
        if (!this.formData.nombre || this.formData.nombre.trim() === '') {
            Swal.fire('Error', 'El nombre del grupo es requerido', 'warning');
            return;
        }

        if (!this.formData.codigo || this.formData.codigo.trim() === '') {
            Swal.fire('Error', 'El código del grupo es requerido', 'warning');
            return;
        }

        if (this.formData.nombre.length > 150) {
            Swal.fire('Error', 'El nombre no puede exceder 150 caracteres', 'warning');
            return;
        }

        if (this.formData.codigo.length > 20) {
            Swal.fire('Error', 'El código no puede exceder 20 caracteres', 'warning');
            return;
        }

        if (this.formData.descripcion && this.formData.descripcion.length > 250) {
            Swal.fire('Error', 'La descripción no puede exceder 250 caracteres', 'warning');
            return;
        }

        if (this.isEditing && this.currentGrupoId) {
            // Actualizar
            this.grupoCuentaContableService.update(this.currentGrupoId, this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Grupo de cuenta contable actualizado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error actualizando grupo:', error);
                    Swal.fire('Error', error.error?.message || 'Error al actualizar el grupo de cuenta contable', 'error');
                }
            });
        } else {
            // Crear
            this.grupoCuentaContableService.create(this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Grupo de cuenta contable creado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error creando grupo:', error);
                    Swal.fire('Error', error.error?.message || 'Error al crear el grupo de cuenta contable', 'error');
                }
            });
        }
    }

    eliminarGrupo(grupo: GrupoCuentaContable) {
        Swal.fire({
            title: '¿Eliminar Grupo?',
            text: `¿Estás seguro de eliminar "${grupo.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.grupoCuentaContableService.delete(grupo.id_grupo_cuenta_contable).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Grupo de cuenta contable eliminado correctamente', 'success');
                        this.cargarDatos();
                    },
                    error: (error: any) => {
                        console.error('Error eliminando grupo:', error);
                        Swal.fire('Error', 'Error al eliminar el grupo de cuenta contable', 'error');
                    }
                });
            }
        });
    }
}
