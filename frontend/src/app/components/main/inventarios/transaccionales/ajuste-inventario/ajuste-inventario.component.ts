import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AjusteInventarioService, CreateAjusteInventarioDto, DetalleAjusteInventario } from '../../../../../services/ajuste-inventario.service';
import { SucursalService } from '../../../../../services/sucursal.service';
import { DepositoService } from '../../../../../services/deposito.service';
import { MonedaService } from '../../../../../services/moneda.service';
import { MotivoAjusteInventarioService } from '../../../../../services/motivo-ajuste-inventario.service';
import { ArticuloService } from '../../../../../services/articulo.service';
import { AuthService } from '../../../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-ajuste-inventario',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './ajuste-inventario.component.html',
    styleUrls: ['./ajuste-inventario.component.css']
})
export class AjusteInventarioComponent implements OnInit {
    loading = false;
    isBlocked = false;
    enEdicion = false;

    // Catálogos
    sucursales: any[] = [];
    depositos: any[] = [];
    monedas: any[] = [];
    motivos: any[] = [];
    articulos: any[] = [];
    tiposAjuste: any[] = [];

    // Formulario Cabecera
    nuevoAjuste: CreateAjusteInventarioDto = {
        id_sucursal: 0,
        id_deposito: 0,
        id_usuario: 0,
        id_moneda: 0,
        id_motivo_ajuste: 0,
        numero_comprobante: 0,
        fecha_documento: new Date().toISOString().split('T')[0],
        tasa_cambio: 1,
        observacion: '',
        tipo_ajuste: 'POSITIVO',
        detalle: []
    };

    // Detalle temporal
    detalleActual: DetalleAjusteInventario = {
        id_articulo: 0,
        numero_item: 0,
        cantidad: 1,
        costo_ml: 0
    };

    articuloSeleccionado: any = null;

    constructor(
        private ajusteService: AjusteInventarioService,
        private sucursalService: SucursalService,
        private depositoService: DepositoService,
        private monedaService: MonedaService,
        private motivoService: MotivoAjusteInventarioService,
        private articuloService: ArticuloService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) { }

    ngOnInit() {
        this.cargarCatalogos();
        // No inicializamos formulario automáticamente, esperamos a botón Nuevo
    }

    cargarCatalogos() {
        this.sucursalService.getAll().subscribe(data => {
            this.sucursales = data;
        });

        this.monedaService.getAll().subscribe(data => {
            this.monedas = data;
        });
        this.motivoService.getAll().subscribe(data => {
            this.motivos = data;
            console.log('Motivos cargados:', this.motivos);
        });
        this.articuloService.getAll().subscribe(data => this.articulos = data);
        // Inicializar tipos de ajuste (pos/neg)
        this.tiposAjuste = [
            { id_tipo_transaccion: 'POSITIVO', nombre: 'Positivo' },
            { id_tipo_transaccion: 'NEGATIVO', nombre: 'Negativo' }
        ];
    }

    onSucursalChange() {
        this.depositos = [];
        this.nuevoAjuste.id_deposito = 0;

        if (this.nuevoAjuste.id_sucursal) {
            this.depositoService.getBySucursal(Number(this.nuevoAjuste.id_sucursal)).subscribe(data => {
                this.depositos = data;
                if (this.depositos.length > 0) {
                    this.nuevoAjuste.id_deposito = this.depositos[0].id_deposito;
                }
            });
        }
    }

    nuevo() {
        this.enEdicion = true;
        this.inicializarFormulario(true); // Pasar flag para cargar número
    }

    cancelar() {
        this.enEdicion = false;
        // Reset manual para asegurar limpieza visual
        this.nuevoAjuste = {
            id_sucursal: 0,
            id_deposito: 0,
            id_usuario: 0,
            id_moneda: 0,
            id_motivo_ajuste: 0,
            numero_comprobante: 0,
            fecha_documento: new Date().toISOString().split('T')[0],
            tasa_cambio: 1,
            observacion: '',
            tipo_ajuste: 'POSITIVO',
            detalle: []
        };
        this.resetDetalleActual();
        this.cdr.detectChanges(); // Forzar actualización de vista
    }

    async inicializarFormulario(cargarNumero = false) {
        const user = this.authService.getCurrentUser();
        const userId = user ? user.id : 0;

        // 1. Resetear formulario primero (Sincrono)
        this.nuevoAjuste = {
            id_sucursal: this.sucursales.length > 0 ? this.sucursales[0].id_sucursal : 0,
            id_deposito: 0,
            id_usuario: userId,
            id_moneda: 1,
            id_motivo_ajuste: 0,
            numero_comprobante: 0,
            fecha_documento: new Date().toISOString().split('T')[0],
            tasa_cambio: 1,
            observacion: '',
            tipo_ajuste: 'POSITIVO',
            detalle: []
        };

        // Moneda por defecto
        const guaranies = this.monedas.find(m => m.id_moneda === 1);
        if (guaranies) this.nuevoAjuste.id_moneda = guaranies.id_moneda;

        // Cargar depósitos iniciales
        if (this.nuevoAjuste.id_sucursal) {
            this.onSucursalChange();
        }

        this.resetDetalleActual();

        // 2. Operaciones Asíncronas
        if (userId) {
            // Verificar Configuración
            this.ajusteService.checkConfig(userId).subscribe({
                next: (config) => {
                    if (!config.hasConfig || !config.hasTerminal) {
                        this.isBlocked = true;
                        let msg = 'Falta configuración para realizar ajustes.';
                        if (!config.hasConfig) msg += ' No tiene configuración de sistema asignada.';
                        if (!config.hasTerminal) msg += ' No tiene terminal asignada.';

                        // Solo mostrar alerta si estamos iniciando (no en cada reset silencioso)
                        if (this.enEdicion) {
                            Swal.fire({
                                title: 'Acceso Restringido',
                                text: msg,
                                icon: 'error'
                            });
                        }
                    } else {
                        this.isBlocked = false;
                    }
                },
                error: (err) => console.error('Error config', err)
            });

            // Cargar Número
            if (cargarNumero) {
                this.ajusteService.getNextNumber(userId).subscribe({
                    next: (res) => {
                        console.log('Número obtenido:', res.numero);
                        this.nuevoAjuste.numero_comprobante = res.numero;
                        this.cdr.markForCheck(); // Asegurar actualización de vista
                    },
                    error: (err) => console.error('Error numeración', err)
                });
            }
        }
    }

    limpiarFormulario() {
        Swal.fire({
            title: '¿Cancelar operación?',
            text: 'Se perderán los datos no guardados',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                this.cancelar();
            }
        });
    }

    resetDetalleActual() {
        this.detalleActual = {
            id_articulo: 0,
            numero_item: 0,
            cantidad: 1,
            costo_ml: 0
        };
        this.articuloSeleccionado = null;
    }

    onArticuloChange() {
        if (this.detalleActual.id_articulo) {
            this.articuloSeleccionado = this.articulos.find(a => a.id_articulo == this.detalleActual.id_articulo);
        } else {
            this.articuloSeleccionado = null;
        }
    }

    agregarItem() {
        if (!this.detalleActual.id_articulo || this.detalleActual.cantidad <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Datos incompletos',
                text: 'Seleccione un artículo y cantidad válida',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }

        const item: DetalleAjusteInventario = {
            ...this.detalleActual,
            numero_item: this.nuevoAjuste.detalle.length + 1,
            articulo: this.articuloSeleccionado
        };

        this.nuevoAjuste.detalle.push(item);
        this.resetDetalleActual();
    }

    eliminarItem(index: number) {
        this.nuevoAjuste.detalle.splice(index, 1);
        this.nuevoAjuste.detalle.forEach((item, i) => item.numero_item = i + 1);
    }

    guardar() {
        if (this.isBlocked) {
            Swal.fire('Error', 'No tiene permisos de configuración.', 'error');
            return;
        }

        // Validación explícita
        console.log('Validando envío:', this.nuevoAjuste);

        if (!this.nuevoAjuste.id_sucursal || this.nuevoAjuste.id_sucursal === 0) {
            Swal.fire('Error', 'Debe seleccionar una Sucursal.', 'warning');
            return;
        }
        if (!this.nuevoAjuste.id_deposito || this.nuevoAjuste.id_deposito === 0) {
            Swal.fire('Error', 'Debe seleccionar un Depósito.', 'warning');
            return;
        }
        if (!this.nuevoAjuste.id_motivo_ajuste || this.nuevoAjuste.id_motivo_ajuste === 0) {
            Swal.fire('Error', 'Debe seleccionar un Motivo de Ajuste.', 'warning');
            return;
        }

        if (this.nuevoAjuste.detalle.length === 0) {
            Swal.fire('Error', 'Agregue al menos un artículo al detalle.', 'warning');
            return;
        }

        // Asegurar tipos numéricos para el backend
        const payload: CreateAjusteInventarioDto = {
            ...this.nuevoAjuste,
            id_sucursal: Number(this.nuevoAjuste.id_sucursal),
            id_deposito: Number(this.nuevoAjuste.id_deposito),
            id_usuario: Number(this.nuevoAjuste.id_usuario),
            id_moneda: Number(this.nuevoAjuste.id_moneda),
            id_motivo_ajuste: Number(this.nuevoAjuste.id_motivo_ajuste),
            numero_comprobante: Number(this.nuevoAjuste.numero_comprobante),
            tasa_cambio: Number(this.nuevoAjuste.tasa_cambio),
            detalle: this.nuevoAjuste.detalle.map(item => {
                const { articulo, ...rest } = item;
                return {
                    ...rest,
                    id_articulo: Number(item.id_articulo),
                    cantidad: Number(item.cantidad),
                    costo_ml: Number(item.costo_ml)
                };
            })
        };

        this.loading = true;
        this.ajusteService.create(payload).subscribe({
            next: () => {
                this.loading = false;
                Swal.fire({
                    title: 'Ajuste Guardado',
                    text: 'El inventario ha sido actualizado correctamente',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                this.enEdicion = false; // Bloquear campos
                this.cancelar(); // Opcional: limpiar formulario o dejarlo visible pero bloqueado. El usuario pidió "bloquear campos y habilitar el nuevo".
                // Si llamo a cancelar(), se borra todo. Si solo pongo enEdicion=false, se queda la info en pantalla pero bloqueada.
                // El usuario dijo: "cuando termina lo mismo, bloquear los campos y habilitar el nuevo para poder volver a procesar".
                // Voy a dejarlo limpio para el siguiente.
            },
            error: (err) => {
                this.loading = false;
                console.error(err);

                let errorMessage = 'No se pudo registrar el ajuste.';
                if (err.error && err.error.message) {
                    errorMessage = err.error.message;
                }

                Swal.fire('Error', errorMessage, 'error');
            }
        });
    }

    calcularTotalNuevoAjuste(): number {
        return this.nuevoAjuste.detalle.reduce((acc, item) => acc + (item.cantidad * (item.costo_ml || 0)), 0);
    }
}
