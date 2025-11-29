import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModuloService, Modulo, CreateModuloDto, UpdateModuloDto } from '../../../../../services/modulo.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-modulos',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './modulos.html',
    styleUrl: './modulos.css'
})
export class Modulos implements OnInit {
    modulos: Modulo[] = [];
    modulosFiltrados: Modulo[] = [];
    modulosPaginados: Modulo[] = [];
    loading = false;
    showForm = false;
    isEditing = false;

    // Búsqueda y paginación
    searchTerm = '';
    currentPage = 1;
    itemsPerPage = 8;
    totalPages = 1;
    pages: number[] = [];

    // Permisos
    canWrite = false;
    canDelete = false;

    // Formulario
    formData: CreateModuloDto | UpdateModuloDto = {
        nombre: '',
        descripcion: '',
        estado: true
    };
    selectedModuloId: number | null = null;

    // Exponer Math al template
    Math = Math;

    constructor(
        private moduloService: ModuloService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        // Cargar permisos para esta ruta
        const currentRoute = '/sistemas/administracion/modulos';
        this.canWrite = this.permissionService.canWrite(currentRoute);
        this.canDelete = this.permissionService.canDelete(currentRoute);

        this.cargarModulos();
    }

    cargarModulos() {
        this.loading = true;
        this.moduloService.getAll().subscribe({
            next: (data) => {
                this.modulos = data;
                this.modulosFiltrados = data;
                this.calcularPaginacion();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error cargando módulos:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los módulos',
                    confirmButtonColor: '#003366'
                });
                this.loading = false;
            }
        });
    }

    onSearch() {
        const term = this.searchTerm.toLowerCase().trim();
        if (!term) {
            this.modulosFiltrados = this.modulos;
        } else {
            this.modulosFiltrados = this.modulos.filter(modulo =>
                modulo.nombre.toLowerCase().includes(term) ||
                (modulo.descripcion && modulo.descripcion.toLowerCase().includes(term))
            );
        }
        this.calcularPaginacion();
    }

    calcularPaginacion() {
        this.totalPages = Math.ceil(this.modulosFiltrados.length / this.itemsPerPage);
        this.pages = this.getPaginationArray();
        this.actualizarPaginaActual();
    }

    getPaginationArray(): number[] {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    actualizarPaginaActual() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.modulosPaginados = this.modulosFiltrados.slice(startIndex, endIndex);
    }

    cambiarPagina(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.actualizarPaginaActual();
        }
    }

    abrirFormularioNuevo() {
        this.isEditing = false;
        this.selectedModuloId = null;
        this.formData = {
            nombre: '',
            descripcion: '',
            estado: true
        };
        this.showForm = true;
    }

    abrirFormularioEditar(modulo: Modulo) {
        this.isEditing = true;
        this.selectedModuloId = modulo.id_modulo;
        this.formData = {
            nombre: modulo.nombre,
            descripcion: modulo.descripcion || '',
            estado: modulo.estado
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.selectedModuloId = null;
        this.formData = {
            nombre: '',
            descripcion: '',
            estado: true
        };
    }

    guardarModulo() {
        // Validaciones
        if (!this.formData.nombre) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor complete el nombre del módulo',
                confirmButtonColor: '#003366'
            });
            return;
        }

        if (this.isEditing && this.selectedModuloId) {
            // Actualizar
            this.moduloService.update(this.selectedModuloId, this.formData).subscribe({
                next: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Actualizado',
                        text: 'Módulo actualizado correctamente',
                        confirmButtonColor: '#003366',
                        timer: 2000
                    });
                    this.cerrarFormulario();
                    this.cargarModulos();
                },
                error: (error) => {
                    console.error('Error actualizando módulo:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.error?.message || 'No se pudo actualizar el módulo',
                        confirmButtonColor: '#003366'
                    });
                }
            });
        } else {
            // Crear
            this.moduloService.create(this.formData as CreateModuloDto).subscribe({
                next: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Creado',
                        text: 'Módulo creado correctamente',
                        confirmButtonColor: '#003366',
                        timer: 2000
                    });
                    this.cerrarFormulario();
                    this.cargarModulos();
                },
                error: (error) => {
                    console.error('Error creando módulo:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.error?.message || 'No se pudo crear el módulo',
                        confirmButtonColor: '#003366'
                    });
                }
            });
        }
    }

    eliminarModulo(modulo: Modulo) {
        Swal.fire({
            title: '¿Eliminar módulo?',
            text: `¿Está seguro de eliminar el módulo "${modulo.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.moduloService.delete(modulo.id_modulo).subscribe({
                    next: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Eliminado',
                            text: 'Módulo eliminado correctamente',
                            confirmButtonColor: '#003366',
                            timer: 2000
                        });
                        this.cargarModulos();
                    },
                    error: (error) => {
                        console.error('Error eliminando módulo:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: error.error?.message || 'No se pudo eliminar el módulo',
                            confirmButtonColor: '#003366'
                        });
                    }
                });
            }
        });
    }
}
