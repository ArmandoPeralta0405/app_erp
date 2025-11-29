import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaProgramaService, CategoriaPrograma, CreateCategoriaProgramaDto, UpdateCategoriaProgramaDto } from '../../../../../services/categoria-programa.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-categorias-programa',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './categorias-programa.html',
    styleUrl: './categorias-programa.css'
})
export class CategoriasPrograma implements OnInit {
    categorias: CategoriaPrograma[] = [];
    categoriasFiltradas: CategoriaPrograma[] = [];
    categoriasPaginadas: CategoriaPrograma[] = [];
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
    formData: CreateCategoriaProgramaDto | UpdateCategoriaProgramaDto = {
        nombre: '',
        descripcion: '',
        estado: true
    };
    selectedCategoriaId: number | null = null;

    // Exponer Math al template
    Math = Math;

    constructor(
        private categoriaProgramaService: CategoriaProgramaService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        // Cargar permisos para esta ruta
        const currentRoute = '/sistemas/administracion/categorias-programa';
        this.canWrite = this.permissionService.canWrite(currentRoute);
        this.canDelete = this.permissionService.canDelete(currentRoute);

        this.cargarCategorias();
    }

    cargarCategorias() {
        this.loading = true;
        this.categoriaProgramaService.getAll().subscribe({
            next: (data) => {
                this.categorias = data;
                this.categoriasFiltradas = data;
                this.calcularPaginacion();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error cargando categorías:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar las categorías',
                    confirmButtonColor: '#003366'
                });
                this.loading = false;
            }
        });
    }

    onSearch() {
        const term = this.searchTerm.toLowerCase().trim();
        if (!term) {
            this.categoriasFiltradas = this.categorias;
        } else {
            this.categoriasFiltradas = this.categorias.filter(categoria =>
                categoria.nombre.toLowerCase().includes(term) ||
                (categoria.descripcion && categoria.descripcion.toLowerCase().includes(term))
            );
        }
        this.calcularPaginacion();
    }

    calcularPaginacion() {
        this.totalPages = Math.ceil(this.categoriasFiltradas.length / this.itemsPerPage);
        this.pages = this.getPaginationArray();
        this.actualizarPaginaActual();
    }

    getPaginationArray(): number[] {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    actualizarPaginaActual() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.categoriasPaginadas = this.categoriasFiltradas.slice(startIndex, endIndex);
    }

    cambiarPagina(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.actualizarPaginaActual();
        }
    }

    abrirFormularioNuevo() {
        this.isEditing = false;
        this.selectedCategoriaId = null;
        this.formData = {
            nombre: '',
            descripcion: '',
            estado: true
        };
        this.showForm = true;
    }

    abrirFormularioEditar(categoria: CategoriaPrograma) {
        this.isEditing = true;
        this.selectedCategoriaId = categoria.id_categoria_programa;
        this.formData = {
            nombre: categoria.nombre,
            descripcion: categoria.descripcion || '',
            estado: categoria.estado
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.selectedCategoriaId = null;
        this.formData = {
            nombre: '',
            descripcion: '',
            estado: true
        };
    }

    guardarCategoria() {
        // Validaciones
        if (!this.formData.nombre) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor complete el nombre de la categoría',
                confirmButtonColor: '#003366'
            });
            return;
        }

        if (this.isEditing && this.selectedCategoriaId) {
            // Actualizar
            this.categoriaProgramaService.update(this.selectedCategoriaId, this.formData).subscribe({
                next: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Actualizado',
                        text: 'Categoría actualizada correctamente',
                        confirmButtonColor: '#003366',
                        timer: 2000
                    });
                    this.cerrarFormulario();
                    this.cargarCategorias();
                },
                error: (error) => {
                    console.error('Error actualizando categoría:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.error?.message || 'No se pudo actualizar la categoría',
                        confirmButtonColor: '#003366'
                    });
                }
            });
        } else {
            // Crear
            this.categoriaProgramaService.create(this.formData as CreateCategoriaProgramaDto).subscribe({
                next: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Creado',
                        text: 'Categoría creada correctamente',
                        confirmButtonColor: '#003366',
                        timer: 2000
                    });
                    this.cerrarFormulario();
                    this.cargarCategorias();
                },
                error: (error) => {
                    console.error('Error creando categoría:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.error?.message || 'No se pudo crear la categoría',
                        confirmButtonColor: '#003366'
                    });
                }
            });
        }
    }

    eliminarCategoria(categoria: CategoriaPrograma) {
        Swal.fire({
            title: '¿Eliminar categoría?',
            text: `¿Está seguro de eliminar la categoría "${categoria.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.categoriaProgramaService.delete(categoria.id_categoria_programa).subscribe({
                    next: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Eliminado',
                            text: 'Categoría eliminada correctamente',
                            confirmButtonColor: '#003366',
                            timer: 2000
                        });
                        this.cargarCategorias();
                    },
                    error: (error) => {
                        console.error('Error eliminando categoría:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: error.error?.message || 'No se pudo eliminar la categoría',
                            confirmButtonColor: '#003366'
                        });
                    }
                });
            }
        });
    }
}
