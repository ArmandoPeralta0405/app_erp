import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgramaAdminService, ProgramaDetalle, CreateProgramaDto, UpdateProgramaDto } from '../../../../../services/programa-admin.service';
import { ModuloService, Modulo } from '../../../../../services/modulo.service';
import { CategoriaProgramaService, CategoriaPrograma } from '../../../../../services/categoria-programa.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-programas',
    imports: [CommonModule, FormsModule],
    templateUrl: './programas.html',
    styleUrl: './programas.css',
})
export class Programas implements OnInit {
    programas: ProgramaDetalle[] = [];
    programasFiltrados: ProgramaDetalle[] = [];
    programasPaginados: ProgramaDetalle[] = [];
    modulos: Modulo[] = [];
    categorias: CategoriaPrograma[] = [];
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
    currentProgramaId: number | null = null;

    formData: CreateProgramaDto = {
        titulo: '',
        codigo_alfanumerico: '',
        ruta_acceso: '',
        id_modulo: 0,
        id_categoria_programa: 0,
        estado: true
    };

    // Permisos
    canWrite = false;
    canDelete = false;

    constructor(
        private programaService: ProgramaAdminService,
        private moduloService: ModuloService,
        private categoriaService: CategoriaProgramaService,
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

        // Cargar programas, módulos y categorías en paralelo
        Promise.all([
            this.programaService.getAll().toPromise(),
            this.moduloService.getAll().toPromise(),
            this.categoriaService.getAll().toPromise()
        ]).then(([programas, modulos, categorias]) => {
            this.programas = programas || [];
            this.modulos = modulos || [];
            this.categorias = categorias || [];
            this.aplicarFiltros();
            this.loading = false;
            this.cdr.detectChanges();
        }).catch(error => {
            console.error('Error cargando datos:', error);
            this.loading = false;
            this.cdr.detectChanges();
            Swal.fire('Error', 'Error al cargar los datos', 'error');
        });
    }

    aplicarFiltros() {
        // Filtrar por búsqueda
        if (this.searchTerm.trim() === '') {
            this.programasFiltrados = [...this.programas];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.programasFiltrados = this.programas.filter(p =>
                p.titulo.toLowerCase().includes(term) ||
                p.codigo_alfanumerico.toLowerCase().includes(term) ||
                p.ruta_acceso.toLowerCase().includes(term) ||
                p.modulo?.nombre.toLowerCase().includes(term) ||
                p.categoria_programa?.nombre.toLowerCase().includes(term)
            );
        }

        // Calcular paginación
        this.totalPages = Math.ceil(this.programasFiltrados.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = 1;
        }

        // Calcular páginas
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

        // Calcular programas paginados
        this.calcularPaginacion();
    }

    calcularPaginacion() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.programasPaginados = this.programasFiltrados.slice(start, end);
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
        this.currentProgramaId = null;
        this.formData = {
            titulo: '',
            codigo_alfanumerico: '',
            ruta_acceso: '',
            id_modulo: 0,
            id_categoria_programa: 0,
            estado: true
        };
        this.showForm = true;
    }

    abrirFormularioEditar(programa: ProgramaDetalle) {
        this.isEditing = true;
        this.currentProgramaId = programa.id_programa;
        this.formData = {
            titulo: programa.titulo,
            codigo_alfanumerico: programa.codigo_alfanumerico,
            ruta_acceso: programa.ruta_acceso,
            id_modulo: programa.id_modulo,
            id_categoria_programa: programa.id_categoria_programa,
            estado: programa.estado
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.currentProgramaId = null;
    }

    guardarPrograma() {
        // Validaciones
        if (!this.formData.titulo || !this.formData.codigo_alfanumerico || !this.formData.ruta_acceso) {
            Swal.fire('Error', 'Por favor complete todos los campos requeridos', 'warning');
            return;
        }

        if (this.formData.id_modulo === 0 || this.formData.id_categoria_programa === 0) {
            Swal.fire('Error', 'Por favor seleccione módulo y categoría', 'warning');
            return;
        }

        if (this.isEditing && this.currentProgramaId) {
            // Actualizar
            this.programaService.update(this.currentProgramaId, this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Programa actualizado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error) => {
                    console.error('Error actualizando programa:', error);
                    Swal.fire('Error', error.error?.message || 'Error al actualizar el programa', 'error');
                }
            });
        } else {
            // Crear
            this.programaService.create(this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Programa creado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error) => {
                    console.error('Error creando programa:', error);
                    Swal.fire('Error', error.error?.message || 'Error al crear el programa', 'error');
                }
            });
        }
    }

    eliminarPrograma(programa: ProgramaDetalle) {
        Swal.fire({
            title: '¿Eliminar programa?',
            text: `¿Estás seguro de eliminar "${programa.titulo}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.programaService.delete(programa.id_programa).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Programa eliminado correctamente', 'success');
                        this.cargarDatos();
                    },
                    error: (error) => {
                        console.error('Error eliminando programa:', error);
                        Swal.fire('Error', 'Error al eliminar el programa', 'error');
                    }
                });
            }
        });
    }
}
