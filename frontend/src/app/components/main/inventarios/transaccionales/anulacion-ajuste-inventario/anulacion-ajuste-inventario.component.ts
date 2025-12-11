import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AjusteInventarioService, AjusteInventario } from '../../../../../services/ajuste-inventario.service';
import { SucursalService } from '../../../../../services/sucursal.service';
import { MonedaService } from '../../../../../services/moneda.service';

@Component({
    selector: 'app-anulacion-ajuste-inventario',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './anulacion-ajuste-inventario.component.html',
    styleUrls: ['./anulacion-ajuste-inventario.component.css']
})
export class AnulacionAjusteInventarioComponent implements OnInit {
    ajustes: AjusteInventario[] = [];
    sucursales: any[] = [];
    monedas: any[] = [];
    loading = false;

    filtros = {
        fecha_desde: '',
        fecha_hasta: '',
        id_sucursal: '',
        id_moneda: ''
    };

    constructor(
        private ajusteService: AjusteInventarioService,
        private sucursalService: SucursalService,
        private monedaService: MonedaService,
        private cd: ChangeDetectorRef
    ) {
        // Inicializar fechas (mes actual)
        const hoy = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        this.filtros.fecha_desde = primerDia.toISOString().split('T')[0];
        this.filtros.fecha_hasta = hoy.toISOString().split('T')[0];
    }

    ngOnInit(): void {
        this.cargarCatalogos();
        // Cargar inicialmente vacío o con los del mes? Mejor esperar a que el usuario busque para evitar carga pesada
        this.buscar();
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
        this.ajusteService.getAll(this.filtros).subscribe({
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
                this.loading = false;
                this.cd.detectChanges();
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                Swal.fire('Error', 'Error al cargar ajustes', 'error');
                this.cd.detectChanges();
            }
        });
    }

    limpiar() {
        const hoy = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        this.filtros = {
            fecha_desde: primerDia.toISOString().split('T')[0],
            fecha_hasta: hoy.toISOString().split('T')[0],
            id_sucursal: '',
            id_moneda: ''
        };
        this.ajustes = [];
        this.buscar();
    }

    eliminar(ajuste: AjusteInventario) {
        Swal.fire({
            title: '¿ELIMINAR DEFINITIVAMENTE?',
            text: `Se eliminará el Ajuste Nº ${ajuste.numero_comprobante}. Esta acción NO se puede deshacer y el inventario será revertido físicamente de la base de datos.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.procesarEliminacion(ajuste.id_movimiento_stock);
            }
        });
    }

    procesarEliminacion(id: number) {
        this.loading = true;
        this.ajusteService.delete(id).subscribe({
            next: () => {
                this.loading = false;
                Swal.fire('Eliminado', 'El ajuste ha sido eliminado correctamente.', 'success');
                this.buscar(); // Recargar lista
            },
            error: (err) => {
                this.loading = false;
                console.error(err);
                Swal.fire('Error', 'No se pudo eliminar el ajuste.', 'error');
            }
        });
    }
}
