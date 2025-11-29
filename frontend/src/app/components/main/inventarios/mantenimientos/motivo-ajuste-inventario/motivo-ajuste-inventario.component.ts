import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MotivoAjusteInventarioService, MotivoAjusteInventario, CreateMotivoAjusteInventarioDto } from '../../../../../services/motivo-ajuste-inventario.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-motivo-ajuste-inventario',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './motivo-ajuste-inventario.component.html',
    styleUrls: ['./motivo-ajuste-inventario.component.css']
})
export class MotivoAjusteInventarioComponent implements OnInit {
    motivos: MotivoAjusteInventario[] = [];
    motivosFiltrados: MotivoAjusteInventario[] = [];
    motivosPaginados: MotivoAjusteInventario[] = [];
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
    currentMotivoId: number | null = null;

    formData: CreateMotivoAjusteInventarioDto = {
        nombre: '',
        descripcion: '',
        estado: true
    };

    // Permisos
    canWrite = false;
    canDelete = false;

    constructor(
        private motivoService: MotivoAjusteInventarioService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        const currentRoute = '/inventarios/mantenimientos/motivos-ajustes';
        this.canWrite = this.permissionService.canWrite(currentRoute);
        this.canDelete = this.permissionService.canDelete(currentRoute);

        this.cargarDatos();
    }

    cargarDatos() {
        this.loading = true;
        this.motivoService.getAll().subscribe({
            next: (motivos) => {
                this.motivos = motivos || [];
                this.aplicarFiltros();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                console.error('Error cargando motivos:', error);
                this.loading = false;
                this.cdr.detectChanges();
                Swal.fire('Error', 'Error al cargar los motivos', 'error');
            }
        });
    }

    aplicarFiltros() {
        if (this.searchTerm.trim() === '') {
            this.motivosFiltrados = [...this.motivos];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.motivosFiltrados = this.motivos.filter(m =>
                m.nombre.toLowerCase().includes(term) ||
                (m.descripcion && m.descripcion.toLowerCase().includes(term))
            );
        }

        this.totalPages = Math.ceil(this.motivosFiltrados.length / this.itemsPerPage);
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
        this.motivosPaginados = this.motivosFiltrados.slice(start, end);
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
        this.currentMotivoId = null;
        this.formData = {
            nombre: '',
            descripcion: '',
            estado: true
        };
        this.showForm = true;
    }

    abrirFormularioEditar(motivo: MotivoAjusteInventario) {
        this.isEditing = true;
        this.currentMotivoId = motivo.id_motivo_ajuste_inventario;
        this.formData = {
            nombre: motivo.nombre,
            descripcion: motivo.descripcion || '',
            estado: motivo.estado
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.currentMotivoId = null;
    }

    guardarMotivo() {
        if (!this.formData.nombre || this.formData.nombre.trim() === '') {
            Swal.fire('Error', 'El nombre es requerido', 'warning');
            return;
        }

        if (this.isEditing && this.currentMotivoId) {
            this.motivoService.update(this.currentMotivoId, this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Motivo actualizado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error actualizando motivo:', error);
                    Swal.fire('Error', error.error?.message || 'Error al actualizar el motivo', 'error');
                }
            });
        } else {
            this.motivoService.create(this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Motivo creado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error creando motivo:', error);
                    Swal.fire('Error', error.error?.message || 'Error al crear el motivo', 'error');
                }
            });
        }
    }

    eliminarMotivo(motivo: MotivoAjusteInventario) {
        Swal.fire({
            title: '¿Eliminar Motivo?',
            text: `¿Estás seguro de eliminar "${motivo.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.motivoService.delete(motivo.id_motivo_ajuste_inventario).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Motivo eliminado correctamente', 'success');
                        this.cargarDatos();
                    },
                    error: (error: any) => {
                        console.error('Error eliminando motivo:', error);
                        Swal.fire('Error', 'Error al eliminar el motivo', 'error');
                    }
                });
            }
        });
    }
}
