import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolService, Rol, CreateRolDto, UpdateRolDto } from '../../../../../services/rol.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-roles',
    imports: [CommonModule, FormsModule],
    templateUrl: './roles.html',
    styleUrl: './roles.css',
})
export class Roles implements OnInit {
    roles: Rol[] = [];
    rolesFiltrados: Rol[] = [];
    rolesPaginados: Rol[] = [];
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
    currentRolId: number | null = null;

    formData: CreateRolDto = {
        nombre: '',
        descripcion: '',
        estado: true
    };

    // Permisos
    canWrite = false;
    canDelete = false;

    constructor(
        private rolService: RolService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        // Cargar permisos para esta ruta
        this.canWrite = this.permissionService.canWrite();
        this.canDelete = this.permissionService.canDelete();

        this.cargarDatos();
    }

    cargarDatos() {
        this.loading = true;

        this.rolService.getAll().toPromise().then(roles => {
            this.roles = roles || [];
            this.aplicarFiltros();
            this.loading = false;
            this.cdr.detectChanges();
        }).catch(error => {
            console.error('Error cargando roles:', error);
            this.loading = false;
            this.cdr.detectChanges();
            Swal.fire('Error', 'Error al cargar los roles', 'error');
        });
    }

    aplicarFiltros() {
        // Filtrar por búsqueda
        if (this.searchTerm.trim() === '') {
            this.rolesFiltrados = [...this.roles];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.rolesFiltrados = this.roles.filter(r =>
                r.nombre.toLowerCase().includes(term) ||
                r.descripcion?.toLowerCase().includes(term)
            );
        }

        // Calcular paginación
        this.totalPages = Math.ceil(this.rolesFiltrados.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = 1;
        }

        // Calcular páginas
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

        // Calcular roles paginados
        this.calcularPaginacion();
    }

    calcularPaginacion() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.rolesPaginados = this.rolesFiltrados.slice(start, end);
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
        this.currentRolId = null;
        this.formData = {
            nombre: '',
            descripcion: '',
            estado: true
        };
        this.showForm = true;
    }

    abrirFormularioEditar(rol: Rol) {
        this.isEditing = true;
        this.currentRolId = rol.id_rol;
        this.formData = {
            nombre: rol.nombre,
            descripcion: rol.descripcion || '',
            estado: rol.estado
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.currentRolId = null;
    }

    guardarRol() {
        // Validaciones
        if (!this.formData.nombre || this.formData.nombre.trim() === '') {
            Swal.fire('Error', 'El nombre del rol es requerido', 'warning');
            return;
        }

        if (this.formData.nombre.length > 150) {
            Swal.fire('Error', 'El nombre no puede exceder 150 caracteres', 'warning');
            return;
        }

        if (this.formData.descripcion && this.formData.descripcion.length > 250) {
            Swal.fire('Error', 'La descripción no puede exceder 250 caracteres', 'warning');
            return;
        }

        if (this.isEditing && this.currentRolId) {
            // Actualizar
            this.rolService.update(this.currentRolId, this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Rol actualizado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error) => {
                    console.error('Error actualizando rol:', error);
                    Swal.fire('Error', error.error?.message || 'Error al actualizar el rol', 'error');
                }
            });
        } else {
            // Crear
            this.rolService.create(this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Rol creado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error) => {
                    console.error('Error creando rol:', error);
                    Swal.fire('Error', error.error?.message || 'Error al crear el rol', 'error');
                }
            });
        }
    }

    eliminarRol(rol: Rol) {
        Swal.fire({
            title: '¿Eliminar rol?',
            text: `¿Estás seguro de eliminar "${rol.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.rolService.delete(rol.id_rol).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Rol eliminado correctamente', 'success');
                        this.cargarDatos();
                    },
                    error: (error) => {
                        console.error('Error eliminando rol:', error);
                        Swal.fire('Error', 'Error al eliminar el rol', 'error');
                    }
                });
            }
        });
    }
}
