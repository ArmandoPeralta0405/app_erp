
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AjusteInventarioService, AjusteInventario } from '../../../../../services/ajuste-inventario.service';
import { SucursalService } from '../../../../../services/sucursal.service';
import { MonedaService } from '../../../../../services/moneda.service';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-consulta-ajuste-inventario',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './consulta-ajuste-inventario.component.html',
    styleUrls: ['./consulta-ajuste-inventario.component.css']
})
export class ConsultaAjusteInventarioComponent implements OnInit {
    // Filtros
    filtros = {
        fecha_desde: '',
        fecha_hasta: '',
        id_sucursal: '',
        id_moneda: '', // Filter by currency
        detallado: false
    };

    // Datos
    ajustes: AjusteInventario[] = [];
    sucursales: any[] = [];
    monedas: any[] = [];
    mostrarMonedaExtranjera = false; // Toggle display
    loading = false;

    // VerDetalle logic is fine already.
    ajusteSeleccionado: AjusteInventario | null = null;
    loadingDetails = false;

    constructor(
        private ajusteService: AjusteInventarioService,
        private sucursalService: SucursalService,
        private monedaService: MonedaService,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.cargarCatalogos();
        // Establecer fechas por defecto (mes actual)
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        this.filtros.fecha_desde = firstDay.toISOString().split('T')[0];
        this.filtros.fecha_hasta = today.toISOString().split('T')[0];

        // Evitar ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
            this.buscar();
        });
    }

    cargarCatalogos() {
        this.sucursalService.getAll().subscribe(data => {
            this.sucursales = data;
            this.cd.detectChanges();
        });
        this.monedaService.getAll().subscribe(data => {
            this.monedas = data;
            this.cd.detectChanges();
        });
    }

    buscar() {
        this.loading = true;
        console.log('Buscando con filtros:', this.filtros);
        this.ajusteService.getAll(this.filtros)
            .pipe(finalize(() => {
                this.loading = false;
                this.cd.detectChanges();
            }))
            .subscribe({
                next: (data) => {
                    this.ajustes = data;
                    if (this.ajustes.length === 0) {
                        Swal.fire({
                            icon: 'info',
                            title: 'Sin resultados',
                            text: 'No se encontraron ajustes con los filtros seleccionados',
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000
                        });
                    }
                    this.cd.detectChanges();
                },
                error: (err) => {
                    console.error('Error buscando ajustes:', err);
                    Swal.fire('Error', 'No se pudieron cargar los ajustes', 'error');
                    this.cd.detectChanges();
                }
            });
    }

    limpiar() {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        this.filtros = {
            fecha_desde: firstDay.toISOString().split('T')[0],
            fecha_hasta: today.toISOString().split('T')[0],
            id_sucursal: '',
            id_moneda: '',
            detallado: false
        };
        this.buscar();
    }

    verDetalle(ajuste: AjusteInventario) {
        if (!ajuste.id_movimiento_stock) return;

        // Feedback inmediato: Abrir modal con datos de cabecera que ya tenemos
        this.ajusteSeleccionado = ajuste;
        this.loadingDetails = true;

        this.ajusteService.getOne(ajuste.id_movimiento_stock)
            .pipe(finalize(() => {
                this.loadingDetails = false;
                console.log('Finalize: loadingDetails = false');
                this.cd.detectChanges();
            }))
            .subscribe({
                next: (data) => {
                    console.log('Detalle recibido:', data);
                    // Actualizamos con la info completa (incluye detalle y relaciones full)
                    this.ajusteSeleccionado = data;
                    this.cd.detectChanges();
                },
                error: (err) => {
                    console.error('Error al recibir detalle:', err);
                    Swal.fire('Error', 'No se pudo cargar el detalle del ajuste', 'error');
                }
            });
    }

    imprimir() {
        this.loading = true;
        this.ajusteService.imprimirListado(this.filtros)
            .pipe(finalize(() => {
                this.loading = false;
                this.cd.detectChanges();
            }))
            .subscribe({
                next: (blob) => {
                    const url = window.URL.createObjectURL(blob);
                    window.open(url, '_blank');
                    // Idealmente liberar URL con revokeObjectURL después de un tiempo
                    setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
                },
                error: (err) => {
                    console.error('Error al generar PDF:', err);
                    Swal.fire('Error', 'No se pudo generar el reporte PDF', 'error');
                }
            });
    }

    cerrarDetalle() {
        this.ajusteSeleccionado = null;
    }
}
