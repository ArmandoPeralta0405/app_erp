import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CotizacionService, Cotizacion, CreateCotizacionDto, UpdateCotizacionDto } from '../../../../../services/cotizacion.service';
import { MonedaService, Moneda } from '../../../../../services/moneda.service';
import { PermissionService } from '../../../../../services/permission.service';
import { NumberFormatDirective } from '../../../../../directives/number-format.directive';
import { NumberFormatPipe } from '../../../../../pipes/number-format.pipe';
import { DateFormatPipe } from '../../../../../pipes/date-format.pipe';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-cotizacion',
    imports: [CommonModule, FormsModule, NumberFormatDirective, NumberFormatPipe, DateFormatPipe],
    templateUrl: './cotizacion.component.html',
    styleUrl: './cotizacion.component.css',
})
export class CotizacionComponent implements OnInit {
    cotizaciones: Cotizacion[] = [];
    cotizacionesFiltradas: Cotizacion[] = [];
    cotizacionesPaginadas: Cotizacion[] = [];
    monedas: Moneda[] = [];
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
    currentIdMoneda: number | null = null;
    currentFecha: string | null = null;

    formData: CreateCotizacionDto = {
        id_moneda: 0,
        fecha: '',
        tasa_compra: 0,
        tasa_venta: 0
    };

    // Permisos
    canWrite = false;
    canDelete = false;

    // Decimales de la moneda seleccionada
    selectedMonedaDecimals: number = 2;

    constructor(
        private cotizacionService: CotizacionService,
        private monedaService: MonedaService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        // Cargar permisos para esta ruta
        const currentRoute = '/finanzas/mantenimientos/cotizaciones';
        this.canWrite = this.permissionService.canWrite(currentRoute);
        this.canDelete = this.permissionService.canDelete(currentRoute);

        this.cargarMonedas();
        this.cargarDatos();
    }

    cargarMonedas() {
        this.monedaService.getAll().subscribe({
            next: (data) => {
                this.monedas = data.filter(m => m.estado);
            },
            error: (error) => {
                console.error('Error cargando monedas:', error);
            }
        });
    }

    cargarDatos() {
        this.loading = true;

        this.cotizacionService.getAll().toPromise().then((cotizaciones: Cotizacion[] | undefined) => {
            this.cotizaciones = cotizaciones || [];
            this.aplicarFiltros();
            this.loading = false;
            this.cdr.detectChanges();
        }).catch((error: any) => {
            console.error('Error cargando cotizaciones:', error);
            this.loading = false;
            this.cdr.detectChanges();
            Swal.fire('Error', 'Error al cargar las cotizaciones', 'error');
        });
    }

    aplicarFiltros() {
        if (this.searchTerm.trim() === '') {
            this.cotizacionesFiltradas = [...this.cotizaciones];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.cotizacionesFiltradas = this.cotizaciones.filter(c =>
                c.moneda?.nombre.toLowerCase().includes(term) ||
                c.moneda?.simbolo.toLowerCase().includes(term) ||
                c.fecha.includes(term)
            );
        }

        this.totalPages = Math.ceil(this.cotizacionesFiltradas.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = 1;
        }

        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.calcularPaginacion();
    }

    calcularPaginacion() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.cotizacionesPaginadas = this.cotizacionesFiltradas.slice(start, end);
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
        this.currentIdMoneda = null;
        this.currentFecha = null;
        this.formData = {
            id_moneda: 0,
            fecha: this.getTodayDate(),
            tasa_compra: 0,
            tasa_venta: 0
        };
        this.showForm = true;
    }

    abrirFormularioEditar(cotizacion: Cotizacion) {
        this.isEditing = true;
        this.currentIdMoneda = cotizacion.id_moneda;
        this.currentFecha = cotizacion.fecha;
        this.formData = {
            id_moneda: cotizacion.id_moneda,
            fecha: this.formatDateForInput(cotizacion.fecha),
            tasa_compra: cotizacion.tasa_compra,
            tasa_venta: cotizacion.tasa_venta
        };

        // Actualizar decimales según la moneda
        const moneda = this.monedas.find(m => m.id_moneda === cotizacion.id_moneda);
        if (moneda) {
            this.selectedMonedaDecimals = moneda.cantidad_decimal || 0;
        }

        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.currentIdMoneda = null;
        this.currentFecha = null;
    }

    getTodayDate(): string {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    formatDateForInput(dateString: string): string {
        // Convertir fecha ISO o cualquier formato a YYYY-MM-DD para input type="date"
        const date = new Date(dateString);
        // Usar UTC para evitar problemas de zona horaria (mismo criterio que el pipe)
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    onMonedaChange() {
        const moneda = this.monedas.find(m => m.id_moneda === this.formData.id_moneda);
        if (moneda) {
            this.selectedMonedaDecimals = moneda.cantidad_decimal || 0;
        }
    }

    parseFormattedNumber(value: string): number {
        if (!value || value === '') return 0;
        // Remover separadores de miles (puntos) y reemplazar coma decimal por punto
        const cleaned = value.replace(/\./g, '').replace(',', '.');
        return parseFloat(cleaned) || 0;
    }

    guardarCotizacion() {
        // Validaciones
        if (!this.formData.id_moneda || this.formData.id_moneda === 0) {
            Swal.fire('Error', 'Debe seleccionar una moneda', 'warning');
            return;
        }

        if (!this.formData.fecha || this.formData.fecha.trim() === '') {
            Swal.fire('Error', 'La fecha es requerida', 'warning');
            return;
        }

        if (this.formData.tasa_compra === null || this.formData.tasa_compra === undefined || this.formData.tasa_compra < 0) {
            Swal.fire('Error', 'La tasa de compra debe ser mayor o igual a 0', 'warning');
            return;
        }

        if (this.formData.tasa_venta === null || this.formData.tasa_venta === undefined || this.formData.tasa_venta < 0) {
            Swal.fire('Error', 'La tasa de venta debe ser mayor o igual a 0', 'warning');
            return;
        }

        // Convertir a números (parsear si vienen formateados)
        this.formData.id_moneda = Number(this.formData.id_moneda);
        this.formData.tasa_compra = this.parseFormattedNumber(String(this.formData.tasa_compra));
        this.formData.tasa_venta = this.parseFormattedNumber(String(this.formData.tasa_venta));

        if (this.isEditing && this.currentIdMoneda && this.currentFecha) {
            // Actualizar
            const updateDto: UpdateCotizacionDto = {
                tasa_compra: this.formData.tasa_compra,
                tasa_venta: this.formData.tasa_venta
            };

            this.cotizacionService.update(this.currentIdMoneda, this.currentFecha, updateDto).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Cotización actualizada correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error actualizando cotización:', error);
                    const errorMessage = Array.isArray(error.error?.message)
                        ? error.error.message.join(', ')
                        : (error.error?.message || 'Error al actualizar la cotización');
                    Swal.fire('Error', errorMessage, 'error');
                }
            });
        } else {
            // Crear
            this.cotizacionService.create(this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Cotización creada correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error creando cotización:', error);
                    const errorMessage = Array.isArray(error.error?.message)
                        ? error.error.message.join(', ')
                        : (error.error?.message || 'Error al crear la cotización');
                    Swal.fire('Error', errorMessage, 'error');
                }
            });
        }
    }

    eliminarCotizacion(cotizacion: Cotizacion) {
        Swal.fire({
            title: '¿Eliminar cotización?',
            text: `¿Estás seguro de eliminar la cotización de ${cotizacion.moneda?.nombre} del ${cotizacion.fecha}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.cotizacionService.delete(cotizacion.id_moneda, cotizacion.fecha).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Cotización eliminada correctamente', 'success');
                        this.cargarDatos();
                    },
                    error: (error: any) => {
                        console.error('Error eliminando cotización:', error);
                        Swal.fire('Error', 'Error al eliminar la cotización', 'error');
                    }
                });
            }
        });
    }
}
