import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticuloDepositoService, Existencia } from '../../../../../services/articulo-deposito.service';
import { DepositoService } from '../../../../../services/deposito.service';
import { LineaService } from '../../../../../services/linea.service';
import { ArticuloService } from '../../../../../services/articulo.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-consulta-existencia-stock',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './consulta-existencia-stock.component.html',
    styleUrl: './consulta-existencia-stock.component.css'
})
export class ConsultaExistenciaStockComponent implements OnInit {
    existencias: Existencia[] = [];
    depositos: any[] = [];
    lineas: any[] = [];
    articulos: any[] = [];
    loading = false;

    filtros = {
        id_deposito: [] as number[],
        id_articulo: null as number | null,
        id_linea: null as number | null,
        solo_con_stock: false
    };

    // Búsqueda de artículos
    txtBusquedaArticulo: string = '';
    articuloSeleccionado: any = null;
    sugerencias: any[] = [];
    mostrarSugerencias: boolean = false;
    indiceSugerencia: number = -1;

    // Totalizadores
    totalArticulos = 0;
    totalExistencia = 0;
    articulosSinStock = 0;

    constructor(
        private articuloDepositoService: ArticuloDepositoService,
        private depositoService: DepositoService,
        private lineaService: LineaService,
        private articuloService: ArticuloService,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.cargarDepositos();
        this.cargarLineas();
        this.cargarArticulos();
        this.buscar(); // Cargar todos al inicio
    }

    cargarDepositos() {
        this.depositoService.getAll().subscribe({
            next: (data: any) => {
                this.depositos = data;
                this.cd.detectChanges();
            },
            error: (err: any) => console.error('Error cargando depósitos:', err)
        });
    }

    cargarLineas() {
        this.lineaService.getAll().subscribe({
            next: (data: any) => {
                this.lineas = data;
                this.cd.detectChanges();
            },
            error: (err: any) => console.error('Error cargando líneas:', err)
        });
    }

    cargarArticulos() {
        this.articuloService.getAll().subscribe({
            next: (data: any) => {
                this.articulos = data;
                this.cd.detectChanges();
            },
            error: (err: any) => console.error('Error cargando artículos:', err)
        });
    }

    onBusquedaInput() {
        const termino = this.txtBusquedaArticulo.trim().toUpperCase();
        if (!termino) {
            this.sugerencias = [];
            this.mostrarSugerencias = false;
            return;
        }

        this.sugerencias = this.articulos.filter(a =>
            (a.codigo_alfanumerico && a.codigo_alfanumerico.toUpperCase().includes(termino)) ||
            a.nombre.toUpperCase().includes(termino) ||
            (a.referencia && a.referencia.toUpperCase().includes(termino))
        ).slice(0, 10);

        this.mostrarSugerencias = this.sugerencias.length > 0;
        this.indiceSugerencia = -1;
    }

    onBusquedaKeydown(e: KeyboardEvent) {
        if (this.mostrarSugerencias) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.indiceSugerencia = Math.min(this.indiceSugerencia + 1, this.sugerencias.length - 1);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.indiceSugerencia = Math.max(this.indiceSugerencia - 1, -1);
                return;
            }
            if (e.key === 'Enter' && this.indiceSugerencia >= 0) {
                e.preventDefault();
                this.seleccionarArticulo(this.sugerencias[this.indiceSugerencia]);
                return;
            }
            if (e.key === 'Escape') {
                this.mostrarSugerencias = false;
                return;
            }
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            this.buscarArticulo();
        }
    }

    buscarArticulo() {
        const termino = this.txtBusquedaArticulo.trim().toUpperCase();
        if (!termino) return;

        // 1. Búsqueda Exacta
        const exacto = this.articulos.find(a =>
            a.id_articulo.toString() === termino ||
            (a.codigo_alfanumerico && a.codigo_alfanumerico.toUpperCase() === termino) ||
            (a.referencia && a.referencia.toUpperCase() === termino)
        );

        if (exacto) {
            this.seleccionarArticulo(exacto);
            return;
        }

        // 2. Búsqueda por Nombre (Parcial)
        const coincidencias = this.articulos.filter(a =>
            a.nombre.toUpperCase().includes(termino)
        );

        if (coincidencias.length === 1) {
            this.seleccionarArticulo(coincidencias[0]);
        } else if (coincidencias.length > 1) {
            const options: any = {};
            coincidencias.slice(0, 15).forEach(c => {
                options[c.id_articulo] = `${c.codigo_alfanumerico || 'S/C'} - ${c.nombre}`;
            });

            Swal.fire({
                title: 'Múltiples coincidencias',
                text: 'Seleccione el artículo',
                input: 'select',
                inputOptions: options,
                inputPlaceholder: 'Seleccione una opción',
                showCancelButton: true,
                confirmButtonText: 'Seleccionar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed && result.value) {
                    const articulo = this.articulos.find(a => a.id_articulo === parseInt(result.value));
                    if (articulo) {
                        this.seleccionarArticulo(articulo);
                    }
                }
            });
        } else {
            Swal.fire('No encontrado', 'No se encontró ningún artículo con ese criterio', 'warning');
        }
    }

    seleccionarArticulo(articulo: any) {
        this.articuloSeleccionado = articulo;
        this.filtros.id_articulo = articulo.id_articulo;
        this.txtBusquedaArticulo = articulo.nombre; // Solo el nombre
        this.mostrarSugerencias = false;
        this.sugerencias = [];
        this.cd.detectChanges();
    }

    limpiarArticulo() {
        this.articuloSeleccionado = null;
        this.filtros.id_articulo = null;
        this.txtBusquedaArticulo = '';
        this.sugerencias = [];
        this.mostrarSugerencias = false;
    }

    buscar() {
        this.loading = true;
        this.articuloDepositoService.getExistencias(this.filtros).subscribe({
            next: (data: Existencia[]) => {
                this.existencias = data;
                this.calcularTotalizadores();
                this.loading = false;
                this.cd.detectChanges();
            },
            error: (err: any) => {
                console.error('Error buscando existencias:', err);
                this.loading = false;
            }
        });
    }

    calcularTotalizadores() {
        this.totalArticulos = this.existencias.length;
        this.totalExistencia = this.existencias.reduce((sum, item) => sum + item.existencia, 0);
        this.articulosSinStock = this.existencias.filter(item => item.existencia === 0).length;
    }

    limpiar() {
        this.filtros = {
            id_deposito: [],
            id_articulo: null,
            id_linea: null,
            solo_con_stock: false
        };
        this.limpiarArticulo();
        this.buscar();
    }
}
