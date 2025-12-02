import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfiguracionSistemaService, ConfiguracionSistema, CreateConfiguracionSistemaDto } from '../../../../../services/configuracion-sistema.service';
import { TipoTransaccionService, TipoTransaccion } from '../../../../../services/tipo-transaccion.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-configuracion-sistema',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './configuracion-sistema.component.html',
    styleUrls: ['./configuracion-sistema.component.css']
})
export class ConfiguracionSistemaComponent implements OnInit {
    configuraciones: any[] = [];
    filteredConfiguraciones: any[] = [];
    searchTerm: string = '';
    tiposTransaccion: TipoTransaccion[] = [];
    loading = false;

    // Formulario
    showForm = false;
    isEditing = false;
    currentId: number | null = null;

    formData: CreateConfiguracionSistemaDto = {
        estado: true
    };

    // Permisos
    canWrite = false;
    canDelete = false;

    constructor(
        private configuracionService: ConfiguracionSistemaService,
        private tipoTransaccionService: TipoTransaccionService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        const currentRoute = '/sistemas/administracion/configuracion-sistema';
        this.canWrite = this.permissionService.canWrite(currentRoute);
        this.canDelete = this.permissionService.canDelete(currentRoute);

        this.cargarDatos();
        this.cargarTiposTransaccion();
    }

    cargarDatos() {
        this.loading = true;
        this.configuracionService.getAll().subscribe({
            next: (data: ConfiguracionSistema[]) => {
                this.configuraciones = data || [];
                this.filteredConfiguraciones = [...this.configuraciones];
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                console.error('Error cargando configuraciones:', error);
                this.loading = false;
                this.cdr.detectChanges();
                Swal.fire('Error', 'Error al cargar las configuraciones', 'error');
            }
        });
    }

    cargarTiposTransaccion() {
        this.tipoTransaccionService.getAll().subscribe({
            next: (data: TipoTransaccion[]) => {
                this.tiposTransaccion = data || [];
            },
            error: (error: any) => {
                console.error('Error cargando tipos de transacción:', error);
            }
        });
    }

    filtrar() {
        const term = this.searchTerm.toLowerCase().trim();

        if (!term) {
            this.filteredConfiguraciones = [...this.configuraciones];
            return;
        }

        this.filteredConfiguraciones = this.configuraciones.filter(config => {
            const id = config.id_configuracion_sistema?.toString().toLowerCase() || '';
            const ajustePos = this.getNombreTipo(config.tipo_transaccion_configuracion_sistema_id_tipo_transaccion_ajuste_positivoTotipo_transaccion).toLowerCase();
            const ajusteNeg = this.getNombreTipo(config.tipo_transaccion_configuracion_sistema_id_tipo_transaccion_ajuste_negativoTotipo_transaccion).toLowerCase();
            const factContEmit = this.getNombreTipo(config.tipo_transaccion_configuracion_sistema_id_tipo_transaccion_factura_contado_emitidaTotipo_transaccion).toLowerCase();
            const factContRec = this.getNombreTipo(config.tipo_transaccion_configuracion_sistema_id_tipo_transaccion_factura_contado_recibidaTotipo_transaccion).toLowerCase();
            const factCredEmit = this.getNombreTipo(config.tipo_transaccion_configuracion_sistema_id_tipo_transaccion_factura_credito_emitidaTotipo_transaccion).toLowerCase();
            const factCredRec = this.getNombreTipo(config.tipo_transaccion_configuracion_sistema_id_tipo_transaccion_factura_credito_recibidaTotipo_transaccion).toLowerCase();

            return id.includes(term) ||
                ajustePos.includes(term) ||
                ajusteNeg.includes(term) ||
                factContEmit.includes(term) ||
                factContRec.includes(term) ||
                factCredEmit.includes(term) ||
                factCredRec.includes(term);
        });
    }

    abrirFormularioNuevo() {
        this.isEditing = false;
        this.currentId = null;
        this.formData = {
            estado: true
        };
        this.showForm = true;
    }

    abrirFormularioEditar(item: ConfiguracionSistema) {
        this.isEditing = true;
        this.currentId = item.id_configuracion_sistema;
        this.formData = {
            id_tipo_transaccion_ajuste_positivo: item.id_tipo_transaccion_ajuste_positivo,
            id_tipo_transaccion_ajuste_negativo: item.id_tipo_transaccion_ajuste_negativo,
            id_tipo_transaccion_factura_contado_emitida: item.id_tipo_transaccion_factura_contado_emitida,
            id_tipo_transaccion_factura_contado_recibida: item.id_tipo_transaccion_factura_contado_recibida,
            id_tipo_transaccion_factura_credito_emitida: item.id_tipo_transaccion_factura_credito_emitida,
            id_tipo_transaccion_factura_credito_recibida: item.id_tipo_transaccion_factura_credito_recibida,
            id_tipo_transaccion_nota_credito_emitida: item.id_tipo_transaccion_nota_credito_emitida,
            id_tipo_transaccion_nota_credito_recibida: item.id_tipo_transaccion_nota_credito_recibida,
            id_tipo_transaccion_remision_emitida: item.id_tipo_transaccion_remision_emitida,
            id_tipo_transaccion_remision_recibida: item.id_tipo_transaccion_remision_recibida,
            estado: item.estado
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.currentId = null;
    }

    guardar() {
        // Convertir a números si vienen como strings (el valor undefined se mantiene)
        const convertToNumber = (val: any) => val ? Number(val) : undefined;

        this.formData.id_tipo_transaccion_ajuste_positivo = convertToNumber(this.formData.id_tipo_transaccion_ajuste_positivo);
        this.formData.id_tipo_transaccion_ajuste_negativo = convertToNumber(this.formData.id_tipo_transaccion_ajuste_negativo);
        this.formData.id_tipo_transaccion_factura_contado_emitida = convertToNumber(this.formData.id_tipo_transaccion_factura_contado_emitida);
        this.formData.id_tipo_transaccion_factura_contado_recibida = convertToNumber(this.formData.id_tipo_transaccion_factura_contado_recibida);
        this.formData.id_tipo_transaccion_factura_credito_emitida = convertToNumber(this.formData.id_tipo_transaccion_factura_credito_emitida);
        this.formData.id_tipo_transaccion_factura_credito_recibida = convertToNumber(this.formData.id_tipo_transaccion_factura_credito_recibida);
        this.formData.id_tipo_transaccion_nota_credito_emitida = convertToNumber(this.formData.id_tipo_transaccion_nota_credito_emitida);
        this.formData.id_tipo_transaccion_nota_credito_recibida = convertToNumber(this.formData.id_tipo_transaccion_nota_credito_recibida);
        this.formData.id_tipo_transaccion_remision_emitida = convertToNumber(this.formData.id_tipo_transaccion_remision_emitida);
        this.formData.id_tipo_transaccion_remision_recibida = convertToNumber(this.formData.id_tipo_transaccion_remision_recibida);

        if (this.isEditing && this.currentId) {
            this.configuracionService.update(this.currentId, this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Configuración actualizada correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error actualizando:', error);
                    Swal.fire('Error', error.error?.message || 'Error al actualizar', 'error');
                }
            });
        } else {
            this.configuracionService.create(this.formData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Configuración creada correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error creando:', error);
                    let errorMessage = 'Error al crear';
                    if (error.error && error.error.message) {
                        errorMessage = Array.isArray(error.error.message) ? error.error.message.join('<br>') : error.error.message;
                    }
                    Swal.fire({
                        title: 'Error',
                        html: errorMessage,
                        icon: 'error'
                    });
                }
            });
        }
    }

    eliminar(item: ConfiguracionSistema) {
        Swal.fire({
            title: '¿Eliminar?',
            text: `¿Estás seguro de eliminar esta configuración?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.configuracionService.delete(item.id_configuracion_sistema).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Registro eliminado correctamente', 'success');
                        this.cargarDatos();
                    },
                    error: (error: any) => {
                        console.error('Error eliminando:', error);
                        Swal.fire('Error', 'Error al eliminar', 'error');
                    }
                });
            }
        });
    }

    getNombreTipo(tipo: TipoTransaccion | undefined): string {
        return tipo ? tipo.nombre : '-';
    }
}
