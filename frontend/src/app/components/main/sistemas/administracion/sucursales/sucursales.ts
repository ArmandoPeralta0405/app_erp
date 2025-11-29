import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SucursalService, Sucursal, CreateSucursalDto, UpdateSucursalDto } from '../../../../../services/sucursal.service';
import { EmpresaService, Empresa } from '../../../../../services/empresa.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-sucursales',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './sucursales.html',
    styleUrl: './sucursales.css'
})
export class Sucursales implements OnInit {
    sucursales: Sucursal[] = [];
    sucursalesFiltradas: Sucursal[] = [];
    sucursalesPaginadas: Sucursal[] = [];
    empresas: Empresa[] = [];
    loading = false;
    showForm = false;
    isEditing = false;

    // Búsqueda y paginación
    searchTerm = '';
    currentPage = 1;
    itemsPerPage = 10;
    totalPages = 1;
    pages: number[] = [];

    // Permisos
    canWrite = false;
    canDelete = false;

    // Formulario
    formData: CreateSucursalDto | UpdateSucursalDto = {
        nombre: '',
        casa_central: 'N',
        telefono: '',
        direccion: '',
        estado: true
    };
    selectedEmpresa: number = 0; // Para el select de empresa
    selectedSucursalId: number | null = null;
    selectedEmpresaId: number | null = null;

    // Exponer Math al template
    Math = Math;

    constructor(
        private sucursalService: SucursalService,
        private empresaService: EmpresaService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        const currentRoute = '/sistemas/administracion/sucursales';
        this.canWrite = this.permissionService.canWrite(currentRoute);
        this.canDelete = this.permissionService.canDelete(currentRoute);

        this.cargarEmpresas();
        this.cargarSucursales();
    }

    cargarEmpresas() {
        this.empresaService.getAll().subscribe({
            next: (data) => {
                this.empresas = data.filter(e => e.estado);
            },
            error: (error) => {
                console.error('Error cargando empresas:', error);
            }
        });
    }

    cargarSucursales() {
        this.loading = true;
        this.sucursalService.getAll().subscribe({
            next: (data) => {
                this.sucursales = data;
                this.sucursalesFiltradas = data;
                this.calcularPaginacion();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error cargando sucursales:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar las sucursales',
                    confirmButtonColor: '#003366'
                });
                this.loading = false;
            }
        });
    }

    onSearch() {
        const term = this.searchTerm.toLowerCase().trim();
        if (!term) {
            this.sucursalesFiltradas = this.sucursales;
        } else {
            this.sucursalesFiltradas = this.sucursales.filter(sucursal =>
                sucursal.nombre.toLowerCase().includes(term) ||
                (sucursal.empresa && sucursal.empresa.razon_social.toLowerCase().includes(term)) ||
                (sucursal.direccion && sucursal.direccion.toLowerCase().includes(term))
            );
        }
        this.calcularPaginacion();
    }

    calcularPaginacion() {
        this.totalPages = Math.ceil(this.sucursalesFiltradas.length / this.itemsPerPage);
        this.pages = this.getPaginationArray();
        this.actualizarPaginaActual();
    }

    getPaginationArray(): number[] {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    actualizarPaginaActual() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.sucursalesPaginadas = this.sucursalesFiltradas.slice(startIndex, endIndex);
    }

    cambiarPagina(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.actualizarPaginaActual();
        }
    }

    abrirFormularioNuevo() {
        this.isEditing = false;
        this.selectedSucursalId = null;
        this.selectedEmpresaId = null;
        this.selectedEmpresa = 0;
        this.formData = {
            nombre: '',
            casa_central: 'N',
            telefono: '',
            direccion: '',
            estado: true
        };
        this.showForm = true;
    }

    abrirFormularioEditar(sucursal: Sucursal) {
        this.isEditing = true;
        this.selectedSucursalId = sucursal.id_sucursal;
        this.selectedEmpresaId = sucursal.id_empresa;
        this.formData = {
            nombre: sucursal.nombre,
            casa_central: sucursal.casa_central,
            telefono: sucursal.telefono || '',
            direccion: sucursal.direccion || '',
            estado: sucursal.estado
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.selectedSucursalId = null;
        this.selectedEmpresaId = null;
        this.selectedEmpresa = 0;
        this.formData = {
            nombre: '',
            casa_central: 'N',
            telefono: '',
            direccion: '',
            estado: true
        };
    }

    guardarSucursal() {
        // Validaciones
        if (!this.isEditing) {
            if (!this.selectedEmpresa || this.selectedEmpresa === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Empresa requerida',
                    text: 'Por favor seleccione una empresa',
                    confirmButtonColor: '#003366'
                });
                return;
            }
        }

        if (!this.formData.nombre) {
            Swal.fire({
                icon: 'warning',
                title: 'Nombre requerido',
                text: 'Por favor ingrese el nombre de la sucursal',
                confirmButtonColor: '#003366'
            });
            return;
        }

        // Convertir strings vacíos a undefined para campos opcionales
        const dataToSend = {
            ...this.formData,
            telefono: this.formData.telefono?.trim() || undefined,
            direccion: this.formData.direccion?.trim() || undefined
        };

        if (this.isEditing && this.selectedSucursalId && this.selectedEmpresaId) {
            // Actualizar
            this.sucursalService.update(this.selectedSucursalId, dataToSend).subscribe({
                next: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Actualizado',
                        text: 'Sucursal actualizada correctamente',
                        confirmButtonColor: '#003366',
                        timer: 2000
                    });
                    this.cerrarFormulario();
                    this.cargarSucursales();
                },
                error: (error) => {
                    console.error('Error actualizando sucursal:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.error?.message || 'No se pudo actualizar la sucursal',
                        confirmButtonColor: '#003366'
                    });
                }
            });
        } else {
            // Crear - agregar id_empresa
            const createData: CreateSucursalDto = {
                ...dataToSend,
                id_empresa: this.selectedEmpresa,
                nombre: dataToSend.nombre!,
                casa_central: dataToSend.casa_central!
            };

            this.sucursalService.create(createData).subscribe({
                next: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Creado',
                        text: 'Sucursal creada correctamente',
                        confirmButtonColor: '#003366',
                        timer: 2000
                    });
                    this.cerrarFormulario();
                    this.cargarSucursales();
                },
                error: (error) => {
                    console.error('Error creando sucursal:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.error?.message || 'No se pudo crear la sucursal',
                        confirmButtonColor: '#003366'
                    });
                }
            });
        }
    }

    eliminarSucursal(sucursal: Sucursal) {
        Swal.fire({
            title: '¿Eliminar sucursal?',
            text: `¿Está seguro de eliminar la sucursal "${sucursal.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.sucursalService.delete(sucursal.id_sucursal).subscribe({
                    next: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Eliminado',
                            text: 'Sucursal eliminada correctamente',
                            confirmButtonColor: '#003366',
                            timer: 2000
                        });
                        this.cargarSucursales();
                    },
                    error: (error) => {
                        console.error('Error eliminando sucursal:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: error.error?.message || 'No se pudo eliminar la sucursal',
                            confirmButtonColor: '#003366'
                        });
                    }
                });
            }
        });
    }

    getEmpresaNombre(idEmpresa: number): string {
        const empresa = this.empresas.find(e => e.id_empresa === idEmpresa);
        return empresa ? empresa.razon_social : 'N/A';
    }
}
