import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonedaService, Moneda, CreateMonedaDto, UpdateMonedaDto } from '../../../../../services/moneda.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-monedas',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './monedas.html',
    styleUrl: './monedas.css'
})
export class Monedas implements OnInit {
    monedas: Moneda[] = [];
    monedasFiltradas: Moneda[] = [];
    monedasPaginadas: Moneda[] = [];
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
    formData: CreateMonedaDto | UpdateMonedaDto = {
        nombre: '',
        simbolo: '',
        cantidad_decimal: 0,
        estado: true
    };
    selectedMonedaId: number | null = null;

    // Exponer Math al template
    Math = Math;

    constructor(
        private monedaService: MonedaService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        // Cargar permisos para esta ruta
        const currentRoute = '/sistemas/administracion/monedas';
        this.canWrite = this.permissionService.canWrite(currentRoute);
        this.canDelete = this.permissionService.canDelete(currentRoute);

        this.cargarMonedas();
    }

    cargarMonedas() {
        this.loading = true;
        this.monedaService.getAll().subscribe({
            next: (data) => {
                this.monedas = data;
                this.monedasFiltradas = data;
                this.calcularPaginacion();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error cargando monedas:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar las monedas',
                    confirmButtonColor: '#003366'
                });
                this.loading = false;
            }
        });
    }

    onSearch() {
        const term = this.searchTerm.toLowerCase().trim();
        if (!term) {
            this.monedasFiltradas = this.monedas;
        } else {
            this.monedasFiltradas = this.monedas.filter(moneda =>
                moneda.nombre.toLowerCase().includes(term) ||
                moneda.simbolo.toLowerCase().includes(term)
            );
        }
        this.calcularPaginacion();
    }

    calcularPaginacion() {
        this.totalPages = Math.ceil(this.monedasFiltradas.length / this.itemsPerPage);
        this.pages = this.getPaginationArray();
        this.actualizarPaginaActual();
    }

    getPaginationArray(): number[] {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    actualizarPaginaActual() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.monedasPaginadas = this.monedasFiltradas.slice(startIndex, endIndex);
    }

    cambiarPagina(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.actualizarPaginaActual();
        }
    }

    abrirFormularioNuevo() {
        this.isEditing = false;
        this.selectedMonedaId = null;
        this.formData = {
            nombre: '',
            simbolo: '',
            cantidad_decimal: 0,
            estado: true
        };
        this.showForm = true;
    }

    abrirFormularioEditar(moneda: Moneda) {
        this.isEditing = true;
        this.selectedMonedaId = moneda.id_moneda;
        this.formData = {
            nombre: moneda.nombre,
            simbolo: moneda.simbolo,
            cantidad_decimal: moneda.cantidad_decimal,
            estado: moneda.estado
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.selectedMonedaId = null;
        this.formData = {
            nombre: '',
            simbolo: '',
            cantidad_decimal: 0,
            estado: true
        };
    }

    guardarMoneda() {
        // Validaciones
        if (!this.formData.nombre || !this.formData.simbolo) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor complete todos los campos obligatorios',
                confirmButtonColor: '#003366'
            });
            return;
        }

        if (this.isEditing && this.selectedMonedaId) {
            // Actualizar
            this.monedaService.update(this.selectedMonedaId, this.formData).subscribe({
                next: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Actualizado',
                        text: 'Moneda actualizada correctamente',
                        confirmButtonColor: '#003366',
                        timer: 2000
                    });
                    this.cerrarFormulario();
                    this.cargarMonedas();
                },
                error: (error) => {
                    console.error('Error actualizando moneda:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.error?.message || 'No se pudo actualizar la moneda',
                        confirmButtonColor: '#003366'
                    });
                }
            });
        } else {
            // Crear
            this.monedaService.create(this.formData as CreateMonedaDto).subscribe({
                next: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Creado',
                        text: 'Moneda creada correctamente',
                        confirmButtonColor: '#003366',
                        timer: 2000
                    });
                    this.cerrarFormulario();
                    this.cargarMonedas();
                },
                error: (error) => {
                    console.error('Error creando moneda:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.error?.message || 'No se pudo crear la moneda',
                        confirmButtonColor: '#003366'
                    });
                }
            });
        }
    }

    eliminarMoneda(moneda: Moneda) {
        Swal.fire({
            title: '¿Eliminar moneda?',
            text: `¿Está seguro de eliminar la moneda "${moneda.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.monedaService.delete(moneda.id_moneda).subscribe({
                    next: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Eliminado',
                            text: 'Moneda eliminada correctamente',
                            confirmButtonColor: '#003366',
                            timer: 2000
                        });
                        this.cargarMonedas();
                    },
                    error: (error) => {
                        console.error('Error eliminando moneda:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: error.error?.message || 'No se pudo eliminar la moneda',
                            confirmButtonColor: '#003366'
                        });
                    }
                });
            }
        });
    }
}
