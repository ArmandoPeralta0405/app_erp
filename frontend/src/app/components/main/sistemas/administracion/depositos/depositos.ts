import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepositoService, Deposito, CreateDepositoDto, UpdateDepositoDto } from '../../../../../services/deposito.service';
import { SucursalService, Sucursal } from '../../../../../services/sucursal.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-depositos',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './depositos.html',
    styleUrl: './depositos.css'
})
export class Depositos implements OnInit {
    depositos: Deposito[] = [];
    depositosFiltrados: Deposito[] = [];
    depositosPaginados: Deposito[] = [];
    sucursales: Sucursal[] = [];
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
    formData: CreateDepositoDto | UpdateDepositoDto = {
        nombre: '',
        estado: true
    };
    selectedSucursal: number = 0;
    selectedDepositoId: number | null = null;
    selectedSucursalId: number | null = null;

    // Exponer Math al template
    Math = Math;

    constructor(
        private depositoService: DepositoService,
        private sucursalService: SucursalService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        const currentRoute = '/sistemas/administracion/depositos';
        this.canWrite = this.permissionService.canWrite(currentRoute);
        this.canDelete = this.permissionService.canDelete(currentRoute);

        this.cargarSucursales();
        this.cargarDepositos();
    }

    cargarSucursales() {
        this.sucursalService.getAll().subscribe({
            next: (data) => {
                this.sucursales = data.filter(s => s.estado);
            },
            error: (error) => {
                console.error('Error cargando sucursales:', error);
            }
        });
    }

    cargarDepositos() {
        this.loading = true;
        this.depositoService.getAll().subscribe({
            next: (data) => {
                this.depositos = data;
                this.depositosFiltrados = data;
                this.calcularPaginacion();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error cargando depósitos:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los depósitos',
                    confirmButtonColor: '#003366'
                });
                this.loading = false;
            }
        });
    }

    onSearch() {
        const term = this.searchTerm.toLowerCase().trim();
        if (!term) {
            this.depositosFiltrados = this.depositos;
        } else {
            this.depositosFiltrados = this.depositos.filter(deposito =>
                deposito.nombre.toLowerCase().includes(term) ||
                (deposito.sucursal && deposito.sucursal.nombre.toLowerCase().includes(term)) ||
                (deposito.sucursal?.empresa && deposito.sucursal.empresa.razon_social.toLowerCase().includes(term))
            );
        }
        this.calcularPaginacion();
    }

    calcularPaginacion() {
        this.totalPages = Math.ceil(this.depositosFiltrados.length / this.itemsPerPage);
        this.pages = this.getPaginationArray();
        this.actualizarPaginaActual();
    }

    getPaginationArray(): number[] {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    actualizarPaginaActual() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.depositosPaginados = this.depositosFiltrados.slice(startIndex, endIndex);
    }

    cambiarPagina(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.actualizarPaginaActual();
        }
    }

    abrirFormularioNuevo() {
        this.isEditing = false;
        this.selectedDepositoId = null;
        this.selectedSucursalId = null;
        this.selectedSucursal = 0;
        this.formData = {
            nombre: '',
            estado: true
        };
        this.showForm = true;
    }

    abrirFormularioEditar(deposito: Deposito) {
        this.isEditing = true;
        this.selectedDepositoId = deposito.id_deposito;
        this.selectedSucursalId = deposito.id_sucursal;
        this.formData = {
            nombre: deposito.nombre,
            estado: deposito.estado
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.selectedDepositoId = null;
        this.selectedSucursalId = null;
        this.selectedSucursal = 0;
        this.formData = {
            nombre: '',
            estado: true
        };
    }

    guardarDeposito() {
        // Validaciones
        if (!this.isEditing) {
            if (!this.selectedSucursal || this.selectedSucursal === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Sucursal requerida',
                    text: 'Por favor seleccione una sucursal',
                    confirmButtonColor: '#003366'
                });
                return;
            }
        }

        if (!this.formData.nombre) {
            Swal.fire({
                icon: 'warning',
                title: 'Nombre requerido',
                text: 'Por favor ingrese el nombre del depósito',
                confirmButtonColor: '#003366'
            });
            return;
        }

        if (this.isEditing && this.selectedDepositoId) {
            // Actualizar
            this.depositoService.update(this.selectedDepositoId, this.formData).subscribe({
                next: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Actualizado',
                        text: 'Depósito actualizado correctamente',
                        confirmButtonColor: '#003366',
                        timer: 2000
                    });
                    this.cerrarFormulario();
                    this.cargarDepositos();
                },
                error: (error) => {
                    console.error('Error actualizando depósito:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.error?.message || 'No se pudo actualizar el depósito',
                        confirmButtonColor: '#003366'
                    });
                }
            });
        } else {
            // Crear
            const createData: CreateDepositoDto = {
                id_sucursal: Number(this.selectedSucursal),
                nombre: this.formData.nombre!,
                estado: this.formData.estado
            };

            this.depositoService.create(createData).subscribe({
                next: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Creado',
                        text: 'Depósito creado correctamente',
                        confirmButtonColor: '#003366',
                        timer: 2000
                    });
                    this.cerrarFormulario();
                    this.cargarDepositos();
                },
                error: (error) => {
                    console.error('Error creando depósito:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.error?.message || 'No se pudo crear el depósito',
                        confirmButtonColor: '#003366'
                    });
                }
            });
        }
    }

    eliminarDeposito(deposito: Deposito) {
        Swal.fire({
            title: '¿Eliminar depósito?',
            text: `¿Está seguro de eliminar el depósito "${deposito.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.depositoService.delete(deposito.id_deposito).subscribe({
                    next: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Eliminado',
                            text: 'Depósito eliminado correctamente',
                            confirmButtonColor: '#003366',
                            timer: 2000
                        });
                        this.cargarDepositos();
                    },
                    error: (error) => {
                        console.error('Error eliminando depósito:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: error.error?.message || 'No se pudo eliminar el depósito',
                            confirmButtonColor: '#003366'
                        });
                    }
                });
            }
        });
    }
}
