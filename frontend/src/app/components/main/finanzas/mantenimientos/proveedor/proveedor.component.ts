import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProveedorService, Proveedor, CreateProveedorDto } from '../../../../../services/proveedor.service';
import { CiudadService, Ciudad } from '../../../../../services/ciudad.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-proveedor',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './proveedor.component.html',
    styleUrls: ['./proveedor.component.css']
})
export class ProveedorComponent implements OnInit {
    proveedores: Proveedor[] = [];
    proveedoresFiltrados: Proveedor[] = [];
    proveedoresPaginados: Proveedor[] = [];
    ciudades: Ciudad[] = [];
    ciudadesFiltradas: Ciudad[] = [];
    ciudadSearchTerm = '';
    loading = true;
    calculandoDV = false;

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
    currentProveedorId: number | null = null;

    formData: CreateProveedorDto = {
        id_ciudad: 0,
        razon_social: '',
        es_contribuyente: false,
        ruc: '',
        dv: '',
        telefono: '',
        direccion: '',
        email: '',
        representante_nombre: '',
        representante_telefono: '',
        representante_email: '',
        estado: true
    };

    // Permisos
    canWrite = false;
    canDelete = false;

    constructor(
        private proveedorService: ProveedorService,
        private ciudadService: CiudadService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        const currentRoute = '/finanzas/mantenimientos/proveedores';
        this.canWrite = this.permissionService.canWrite(currentRoute);
        this.canDelete = this.permissionService.canDelete(currentRoute);

        this.cargarDatos();
        this.cargarCiudades();
    }

    cargarDatos() {
        this.loading = true;

        this.proveedorService.getAll().subscribe({
            next: (proveedores) => {
                this.proveedores = proveedores || [];
                this.aplicarFiltros();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                console.error('Error cargando proveedores:', error);
                this.loading = false;
                this.cdr.detectChanges();
                Swal.fire('Error', 'Error al cargar los proveedores', 'error');
            }
        });
    }

    cargarCiudades() {
        this.ciudadService.getAll().subscribe({
            next: (ciudades) => {
                this.ciudades = ciudades.filter(c => c.estado) || [];
                this.ciudadesFiltradas = this.ciudades;
            },
            error: (error: any) => {
                console.error('Error cargando ciudades:', error);
            }
        });
    }

    filtrarCiudades() {
        const term = this.ciudadSearchTerm.toLowerCase().trim();
        if (!term) {
            this.ciudadesFiltradas = this.ciudades;
        } else {
            this.ciudadesFiltradas = this.ciudades.filter(c =>
                c.nombre.toLowerCase().includes(term) ||
                (c.departamento && c.departamento.nombre.toLowerCase().includes(term))
            );
        }
    }

    aplicarFiltros() {
        if (this.searchTerm.trim() === '') {
            this.proveedoresFiltrados = [...this.proveedores];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.proveedoresFiltrados = this.proveedores.filter(p =>
                p.razon_social.toLowerCase().includes(term) ||
                (p.ruc && p.ruc.toLowerCase().includes(term)) ||
                (p.email && p.email.toLowerCase().includes(term)) ||
                (p.representante_nombre && p.representante_nombre.toLowerCase().includes(term))
            );
        }

        this.totalPages = Math.ceil(this.proveedoresFiltrados.length / this.itemsPerPage);
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
        this.proveedoresPaginados = this.proveedoresFiltrados.slice(start, end);
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
        this.currentProveedorId = null;
        this.formData = {
            id_ciudad: 0,
            razon_social: '',
            es_contribuyente: false,
            ruc: '',
            dv: '',
            telefono: '',
            direccion: '',
            email: '',
            representante_nombre: '',
            representante_telefono: '',
            representante_email: '',
            estado: true
        };
        this.showForm = true;
    }

    abrirFormularioEditar(proveedor: Proveedor) {
        this.isEditing = true;
        this.currentProveedorId = proveedor.id_proveedor;
        this.formData = {
            id_ciudad: proveedor.id_ciudad,
            razon_social: proveedor.razon_social,
            es_contribuyente: proveedor.es_contribuyente !== undefined ? proveedor.es_contribuyente : false,
            ruc: proveedor.ruc || '',
            dv: proveedor.dv || '',
            telefono: proveedor.telefono || '',
            direccion: proveedor.direccion || '',
            email: proveedor.email || '',
            representante_nombre: proveedor.representante_nombre || '',
            representante_telefono: proveedor.representante_telefono || '',
            representante_email: proveedor.representante_email || '',
            estado: proveedor.estado !== undefined ? proveedor.estado : true
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.currentProveedorId = null;
        this.ciudadSearchTerm = '';
        this.ciudadesFiltradas = this.ciudades;
    }

    calcularDV() {
        if (!this.formData.ruc || this.formData.ruc.trim() === '') {
            Swal.fire({
                icon: 'warning',
                title: 'RUC requerido',
                text: 'Por favor ingrese el RUC antes de calcular el dígito verificador',
                confirmButtonColor: '#003366'
            });
            return;
        }

        if (!/^\d+$/.test(this.formData.ruc)) {
            Swal.fire({
                icon: 'warning',
                title: 'RUC inválido',
                text: 'El RUC debe contener solo números',
                confirmButtonColor: '#003366'
            });
            return;
        }

        this.calculandoDV = true;
        this.proveedorService.calcularDV(this.formData.ruc).subscribe({
            next: (response) => {
                this.formData.dv = response.dv.toString();
                this.calculandoDV = false;
                Swal.fire({
                    icon: 'success',
                    title: 'DV Calculado',
                    text: `Dígito verificador: ${response.dv}`,
                    confirmButtonColor: '#003366',
                    timer: 2000
                });
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error calculando DV:', error);
                this.calculandoDV = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.error?.message || 'No se pudo calcular el dígito verificador',
                    confirmButtonColor: '#003366'
                });
            }
        });
    }

    guardarProveedor() {
        if (!this.formData.id_ciudad || this.formData.id_ciudad === 0) {
            Swal.fire('Error', 'Debe seleccionar una ciudad', 'warning');
            return;
        }

        if (!this.formData.razon_social || this.formData.razon_social.trim() === '') {
            Swal.fire('Error', 'La razón social es requerida', 'warning');
            return;
        }

        if (!this.formData.ruc || this.formData.ruc.trim() === '') {
            Swal.fire('Error', 'El RUC/CI es requerido', 'warning');
            return;
        }

        if (this.isEditing && this.currentProveedorId) {
            this.proveedorService.update(this.currentProveedorId, this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Proveedor actualizado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error actualizando proveedor:', error);
                    Swal.fire('Error', error.error?.message || 'Error al actualizar el proveedor', 'error');
                }
            });
        } else {
            this.proveedorService.create(this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Proveedor creado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error creando proveedor:', error);
                    Swal.fire('Error', error.error?.message || 'Error al crear el proveedor', 'error');
                }
            });
        }
    }

    eliminarProveedor(proveedor: Proveedor) {
        Swal.fire({
            title: '¿Eliminar Proveedor?',
            text: `¿Estás seguro de eliminar "${proveedor.razon_social}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.proveedorService.delete(proveedor.id_proveedor).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Proveedor eliminado correctamente', 'success');
                        this.cargarDatos();
                    },
                    error: (error: any) => {
                        console.error('Error eliminando proveedor:', error);
                        Swal.fire('Error', 'Error al eliminar el proveedor', 'error');
                    }
                });
            }
        });
    }

    getDocumento(proveedor: Proveedor): string {
        if (proveedor.es_contribuyente) {
            return proveedor.ruc ? `${proveedor.ruc}${proveedor.dv ? '-' + proveedor.dv : ''}` : 'N/A';
        } else {
            return proveedor.ruc || 'N/A';
        }
    }

    getTipoDocumento(proveedor: Proveedor): string {
        return proveedor.es_contribuyente ? 'RUC' : 'CI';
    }
}
