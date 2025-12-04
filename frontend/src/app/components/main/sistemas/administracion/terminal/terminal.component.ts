import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TerminalService, Terminal, CreateTerminalDto, UpdateTerminalDto } from '../../../../../services/terminal.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-terminal',
    imports: [CommonModule, FormsModule],
    templateUrl: './terminal.component.html',
    styleUrl: './terminal.component.css',
})
export class TerminalComponent implements OnInit {
    terminales: Terminal[] = [];
    terminalesFiltrados: Terminal[] = [];
    terminalesPaginados: Terminal[] = [];
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
    currentTerminalId: number | null = null;

    formData: CreateTerminalDto = {
        nombre: '',
        limite_items: 15,
        observacion: '',
        ultimo_numero_factura: 0,
        ultimo_numero_nota_credito: 0,
        ultimo_numero_remision: 0,
        estado: true
    };

    // Campos separados para números de documento
    // Factura
    facturaEstablecimiento = '000';
    facturaPuntoExpedicion = '000';
    facturaSecuencia = '0000000';

    // Nota de Crédito
    notaCreditoEstablecimiento = '000';
    notaCreditoPuntoExpedicion = '000';
    notaCreditoSecuencia = '0000000';

    // Remisión
    remisionEstablecimiento = '000';
    remisionPuntoExpedicion = '000';
    remisionSecuencia = '0000000';

    // Permisos
    canWrite = false;
    canDelete = false;

    constructor(
        private terminalService: TerminalService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        const currentRoute = '/sistemas/administracion/terminales';
        this.canWrite = this.permissionService.canWrite(currentRoute);
        this.canDelete = this.permissionService.canDelete(currentRoute);
        this.cargarDatos();
    }

    cargarDatos() {
        this.loading = true;
        this.terminalService.getAll().subscribe({
            next: (terminales) => {
                this.terminales = terminales || [];
                this.aplicarFiltros();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                console.error('Error cargando terminales:', error);
                this.loading = false;
                this.cdr.detectChanges();
                Swal.fire('Error', 'Error al cargar las terminales', 'error');
            }
        });
    }

    aplicarFiltros() {
        if (this.searchTerm.trim() === '') {
            this.terminalesFiltrados = [...this.terminales];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.terminalesFiltrados = this.terminales.filter(t =>
                t.nombre.toLowerCase().includes(term) ||
                (t.observacion && t.observacion.toLowerCase().includes(term))
            );
        }

        this.totalPages = Math.ceil(this.terminalesFiltrados.length / this.itemsPerPage);
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
        this.terminalesPaginados = this.terminalesFiltrados.slice(start, end);
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
        this.currentTerminalId = null;
        this.formData = {
            nombre: '',
            limite_items: 15,
            observacion: '',
            ultimo_numero_factura: 0,
            ultimo_numero_nota_credito: 0,
            ultimo_numero_remision: 0,
            estado: true
        };
        // Resetear campos de números
        this.facturaEstablecimiento = '000';
        this.facturaPuntoExpedicion = '000';
        this.facturaSecuencia = '0000000';

        this.notaCreditoEstablecimiento = '000';
        this.notaCreditoPuntoExpedicion = '000';
        this.notaCreditoSecuencia = '0000000';

        this.remisionEstablecimiento = '000';
        this.remisionPuntoExpedicion = '000';
        this.remisionSecuencia = '0000000';

        this.showForm = true;
    }

    abrirFormularioEditar(terminal: Terminal) {
        this.isEditing = true;
        this.currentTerminalId = terminal.id_terminal;
        this.formData = {
            nombre: terminal.nombre,
            limite_items: terminal.limite_items || 15,
            observacion: terminal.observacion || '',
            ultimo_numero_factura: terminal.ultimo_numero_factura || 0,
            ultimo_numero_nota_credito: terminal.ultimo_numero_nota_credito || 0,
            ultimo_numero_remision: terminal.ultimo_numero_remision || 0,
            estado: terminal.estado !== undefined ? terminal.estado : true
        };

        // Separar los valores recuperados en 3 partes
        this.separarNumero(terminal.ultimo_numero_factura || 0, 'factura');
        this.separarNumero(terminal.ultimo_numero_nota_credito || 0, 'notaCredito');
        this.separarNumero(terminal.ultimo_numero_remision || 0, 'remision');

        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.currentTerminalId = null;
    }

    // Separar número en 3 partes: establecimiento-puntoExpedicion-secuencia
    separarNumero(numero: number, tipo: 'factura' | 'notaCredito' | 'remision') {
        const numStr = numero.toString().padStart(13, '0');
        const establecimiento = numStr.substring(0, 3);
        const puntoExpedicion = numStr.substring(3, 6);
        const secuencia = numStr.substring(6, 13);

        switch (tipo) {
            case 'factura':
                this.facturaEstablecimiento = establecimiento;
                this.facturaPuntoExpedicion = puntoExpedicion;
                this.facturaSecuencia = secuencia;
                break;
            case 'notaCredito':
                this.notaCreditoEstablecimiento = establecimiento;
                this.notaCreditoPuntoExpedicion = puntoExpedicion;
                this.notaCreditoSecuencia = secuencia;
                break;
            case 'remision':
                this.remisionEstablecimiento = establecimiento;
                this.remisionPuntoExpedicion = puntoExpedicion;
                this.remisionSecuencia = secuencia;
                break;
        }
    }

    // Unir los 3 campos en un solo número
    unirNumero(tipo: 'factura' | 'notaCredito' | 'remision'): number {
        let establecimiento: string;
        let puntoExpedicion: string;
        let secuencia: string;

        switch (tipo) {
            case 'factura':
                establecimiento = this.facturaEstablecimiento.padStart(3, '0');
                puntoExpedicion = this.facturaPuntoExpedicion.padStart(3, '0');
                secuencia = this.facturaSecuencia.padStart(7, '0');
                break;
            case 'notaCredito':
                establecimiento = this.notaCreditoEstablecimiento.padStart(3, '0');
                puntoExpedicion = this.notaCreditoPuntoExpedicion.padStart(3, '0');
                secuencia = this.notaCreditoSecuencia.padStart(7, '0');
                break;
            case 'remision':
                establecimiento = this.remisionEstablecimiento.padStart(3, '0');
                puntoExpedicion = this.remisionPuntoExpedicion.padStart(3, '0');
                secuencia = this.remisionSecuencia.padStart(7, '0');
                break;
        }

        const numeroCompleto = establecimiento + puntoExpedicion + secuencia;
        return parseInt(numeroCompleto, 10) || 0;
    }

    // Obtener preview formateado
    getPreview(tipo: 'factura' | 'notaCredito' | 'remision'): string {
        let establecimiento: string;
        let puntoExpedicion: string;
        let secuencia: string;

        switch (tipo) {
            case 'factura':
                establecimiento = this.facturaEstablecimiento.padStart(3, '0');
                puntoExpedicion = this.facturaPuntoExpedicion.padStart(3, '0');
                secuencia = this.facturaSecuencia.padStart(7, '0');
                break;
            case 'notaCredito':
                establecimiento = this.notaCreditoEstablecimiento.padStart(3, '0');
                puntoExpedicion = this.notaCreditoPuntoExpedicion.padStart(3, '0');
                secuencia = this.notaCreditoSecuencia.padStart(7, '0');
                break;
            case 'remision':
                establecimiento = this.remisionEstablecimiento.padStart(3, '0');
                puntoExpedicion = this.remisionPuntoExpedicion.padStart(3, '0');
                secuencia = this.remisionSecuencia.padStart(7, '0');
                break;
        }

        return `${establecimiento}-${puntoExpedicion}-${secuencia}`;
    }

    // Formatear número para mostrar en tabla
    formatearNumeroDocumento(numero: number): string {
        if (numero === null || numero === undefined) return '000-000-0000000';
        const numStr = numero.toString().padStart(13, '0');
        return `${numStr.substring(0, 3)}-${numStr.substring(3, 6)}-${numStr.substring(6, 13)}`;
    }

    // Actualizar formData cuando cambian los campos
    onNumeroChange(tipo: 'factura' | 'notaCredito' | 'remision') {
        const numero = this.unirNumero(tipo);
        switch (tipo) {
            case 'factura':
                this.formData.ultimo_numero_factura = numero;
                break;
            case 'notaCredito':
                this.formData.ultimo_numero_nota_credito = numero;
                break;
            case 'remision':
                this.formData.ultimo_numero_remision = numero;
                break;
        }
    }

    guardarTerminal() {
        if (!this.formData.nombre || this.formData.nombre.trim() === '') {
            Swal.fire('Error', 'El nombre de la terminal es requerido', 'warning');
            return;
        }

        if (this.formData.nombre.length > 150) {
            Swal.fire('Error', 'El nombre no puede exceder 150 caracteres', 'warning');
            return;
        }

        // Actualizar los números antes de guardar
        this.formData.ultimo_numero_factura = this.unirNumero('factura');
        this.formData.ultimo_numero_nota_credito = this.unirNumero('notaCredito');
        this.formData.ultimo_numero_remision = this.unirNumero('remision');

        if (this.isEditing && this.currentTerminalId) {
            this.terminalService.update(this.currentTerminalId, this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Terminal actualizada correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error actualizando terminal:', error);
                    Swal.fire('Error', error.error?.message || 'Error al actualizar la terminal', 'error');
                }
            });
        } else {
            this.terminalService.create(this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Terminal creada correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error creando terminal:', error);
                    Swal.fire('Error', error.error?.message || 'Error al crear la terminal', 'error');
                }
            });
        }
    }

    eliminarTerminal(terminal: Terminal) {
        Swal.fire({
            title: '¿Desactivar Terminal?',
            text: `¿Estás seguro de desactivar "${terminal.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, desactivar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.terminalService.delete(terminal.id_terminal).subscribe({
                    next: () => {
                        Swal.fire('Desactivada', 'Terminal desactivada correctamente', 'success');
                        this.cargarDatos();
                    },
                    error: (error: any) => {
                        console.error('Error desactivando terminal:', error);
                        Swal.fire('Error', 'Error al desactivar la terminal', 'error');
                    }
                });
            }
        });
    }

    getUsuariosAsignados(terminal: Terminal): number {
        return terminal.usuario_terminal?.length || 0;
    }
}
