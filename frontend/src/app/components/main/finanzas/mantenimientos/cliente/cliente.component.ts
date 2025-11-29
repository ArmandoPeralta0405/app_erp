import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService, Cliente, CreateClienteDto } from '../../../../../services/cliente.service';
import { CiudadService, Ciudad } from '../../../../../services/ciudad.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-cliente',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './cliente.component.html',
    styleUrls: ['./cliente.component.css']
})
export class ClienteComponent implements OnInit {
    clientes: Cliente[] = [];
    clientesFiltrados: Cliente[] = [];
    clientesPaginados: Cliente[] = [];
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
    currentClienteId: number | null = null;

    formData: CreateClienteDto = {
        id_ciudad: 0,
        nombre: '',
        es_contribuyente: false,
        ruc: '',
        ci: '',
        dv: '',
        telefono: '',
        direccion: '',
        email: '',
        estado: true
    };

    // Permisos
    canWrite = false;
    canDelete = false;

    constructor(
        private clienteService: ClienteService,
        private ciudadService: CiudadService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        // Cargar permisos para esta ruta
        const currentRoute = '/finanzas/mantenimientos/clientes';
        this.canWrite = this.permissionService.canWrite(currentRoute);
        this.canDelete = this.permissionService.canDelete(currentRoute);

        this.cargarDatos();
        this.cargarCiudades();
    }

    cargarDatos() {
        this.loading = true;

        this.clienteService.getAll().subscribe({
            next: (clientes) => {
                this.clientes = clientes || [];
                this.aplicarFiltros();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                console.error('Error cargando clientes:', error);
                this.loading = false;
                this.cdr.detectChanges();
                Swal.fire('Error', 'Error al cargar los clientes', 'error');
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
        // Filtrar por búsqueda
        if (this.searchTerm.trim() === '') {
            this.clientesFiltrados = [...this.clientes];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.clientesFiltrados = this.clientes.filter(c =>
                c.nombre.toLowerCase().includes(term) ||
                (c.ruc && c.ruc.toLowerCase().includes(term)) ||
                (c.ci && c.ci.toLowerCase().includes(term)) ||
                (c.email && c.email.toLowerCase().includes(term))
            );
        }

        // Calcular paginación
        this.totalPages = Math.ceil(this.clientesFiltrados.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = 1;
        }

        // Calcular páginas visibles (paginación inteligente)
        this.pages = this.calcularPaginasVisibles();

        // Calcular clientes paginados
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
        this.clientesPaginados = this.clientesFiltrados.slice(start, end);
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
        this.currentClienteId = null;
        this.formData = {
            id_ciudad: 0,
            nombre: '',
            es_contribuyente: false,
            ruc: '',
            ci: '',
            dv: '',
            telefono: '',
            direccion: '',
            email: '',
            estado: true
        };
        this.showForm = true;
    }

    abrirFormularioEditar(cliente: Cliente) {
        this.isEditing = true;
        this.currentClienteId = cliente.id_cliente;
        this.formData = {
            id_ciudad: cliente.id_ciudad,
            nombre: cliente.nombre,
            es_contribuyente: cliente.es_contribuyente !== undefined ? cliente.es_contribuyente : false,
            ruc: cliente.ruc || '',
            ci: cliente.ci || '',
            dv: cliente.dv || '',
            telefono: cliente.telefono || '',
            direccion: cliente.direccion || '',
            email: cliente.email || '',
            estado: cliente.estado !== undefined ? cliente.estado : true
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.currentClienteId = null;
        this.ciudadSearchTerm = '';
        this.ciudadesFiltradas = this.ciudades;
    }

    // Calcular DV automáticamente
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

        // Validar que el RUC sea numérico
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
        this.clienteService.calcularDV(this.formData.ruc).subscribe({
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

    guardarCliente() {
        // Validaciones
        if (!this.formData.id_ciudad || this.formData.id_ciudad === 0) {
            Swal.fire('Error', 'Debe seleccionar una ciudad', 'warning');
            return;
        }

        if (!this.formData.nombre || this.formData.nombre.trim() === '') {
            Swal.fire('Error', 'El nombre del cliente es requerido', 'warning');
            return;
        }

        if (this.formData.nombre.length > 250) {
            Swal.fire('Error', 'El nombre no puede exceder 250 caracteres', 'warning');
            return;
        }

        // Validar RUC o CI según tipo de contribuyente
        if (this.formData.es_contribuyente) {
            if (!this.formData.ruc || this.formData.ruc.trim() === '') {
                Swal.fire('Error', 'El RUC es requerido para contribuyentes', 'warning');
                return;
            }
        } else {
            if (!this.formData.ci || this.formData.ci.trim() === '') {
                Swal.fire('Error', 'La Cédula de Identidad es requerida para no contribuyentes', 'warning');
                return;
            }
        }

        if (this.isEditing && this.currentClienteId) {
            // Actualizar
            this.clienteService.update(this.currentClienteId, this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Cliente actualizado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error actualizando cliente:', error);
                    Swal.fire('Error', error.error?.message || 'Error al actualizar el cliente', 'error');
                }
            });
        } else {
            // Crear
            this.clienteService.create(this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Cliente creado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error creando cliente:', error);
                    Swal.fire('Error', error.error?.message || 'Error al crear el cliente', 'error');
                }
            });
        }
    }

    eliminarCliente(cliente: Cliente) {
        Swal.fire({
            title: '¿Eliminar Cliente?',
            text: `¿Estás seguro de eliminar "${cliente.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.clienteService.delete(cliente.id_cliente).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Cliente eliminado correctamente', 'success');
                        this.cargarDatos();
                    },
                    error: (error: any) => {
                        console.error('Error eliminando cliente:', error);
                        Swal.fire('Error', 'Error al eliminar el cliente', 'error');
                    }
                });
            }
        });
    }

    getDocumento(cliente: Cliente): string {
        if (cliente.es_contribuyente) {
            return cliente.ruc ? `${cliente.ruc}${cliente.dv ? '-' + cliente.dv : ''}` : 'N/A';
        } else {
            return cliente.ci || 'N/A';
        }
    }

    getTipoDocumento(cliente: Cliente): string {
        return cliente.es_contribuyente ? 'RUC' : 'CI';
    }
}
