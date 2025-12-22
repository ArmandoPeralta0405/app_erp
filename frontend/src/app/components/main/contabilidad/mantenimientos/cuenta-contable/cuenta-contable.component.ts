import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CuentaContableService, CuentaContable, CreateCuentaContableDto, UpdateCuentaContableDto } from '../../../../../services/cuenta-contable.service';
import { GrupoCuentaContableService, GrupoCuentaContable } from '../../../../../services/grupo-cuenta-contable.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-cuenta-contable',
    imports: [CommonModule, FormsModule],
    templateUrl: './cuenta-contable.component.html',
    styleUrl: './cuenta-contable.component.css',
})
export class CuentaContableComponent implements OnInit {
    cuentasContables: CuentaContable[] = [];
    cuentasFiltradas: CuentaContable[] = [];
    cuentasPaginadas: CuentaContable[] = [];
    gruposCuentaContable: GrupoCuentaContable[] = [];
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
    currentCuentaId: number | null = null;

    formData: CreateCuentaContableDto = {
        numero_cuenta: '',
        descripcion: '',
        nivel: 1,
        id_grupo_cuenta_contable: 0,
        estado: true
    };

    // Permisos
    canWrite = false;
    canDelete = false;

    constructor(
        private cuentaContableService: CuentaContableService,
        private grupoCuentaContableService: GrupoCuentaContableService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        // Cargar permisos para esta ruta
        this.canWrite = this.permissionService.canWrite('/contabilidad/mantenimientos/cuentas-contables');
        this.canDelete = this.permissionService.canDelete('/contabilidad/mantenimientos/cuentas-contables');

        this.cargarGrupos();
        this.cargarDatos();
    }

    cargarGrupos() {
        this.grupoCuentaContableService.getAll().subscribe({
            next: (grupos) => {
                console.log('Grupos cargados:', grupos);
                // Cargar todos los grupos
                this.gruposCuentaContable = grupos || [];
                console.log('Grupos asignados:', this.gruposCuentaContable);
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                console.error('Error cargando grupos de cuenta contable:', error);
                Swal.fire('Error', 'Error al cargar los grupos de cuenta contable', 'error');
            }
        });
    }

    cargarDatos() {
        this.loading = true;

        this.cuentaContableService.getAll().subscribe({
            next: (cuentas) => {
                this.cuentasContables = cuentas || [];
                this.aplicarFiltros();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                console.error('Error cargando cuentas contables:', error);
                this.loading = false;
                this.cdr.detectChanges();
                Swal.fire('Error', 'Error al cargar las cuentas contables', 'error');
            }
        });
    }

    aplicarFiltros() {
        // Filtrar por búsqueda
        if (this.searchTerm.trim() === '') {
            this.cuentasFiltradas = [...this.cuentasContables];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.cuentasFiltradas = this.cuentasContables.filter(c =>
                c.numero_cuenta.toLowerCase().includes(term) ||
                c.descripcion.toLowerCase().includes(term) ||
                (c.grupo_cuenta_contable?.nombre && c.grupo_cuenta_contable.nombre.toLowerCase().includes(term)) ||
                (c.grupo_cuenta_contable?.codigo && c.grupo_cuenta_contable.codigo.toLowerCase().includes(term))
            );
        }

        // Calcular paginación
        this.totalPages = Math.ceil(this.cuentasFiltradas.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = 1;
        }

        // Calcular páginas
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

        // Calcular cuentas paginadas
        this.calcularPaginacion();
    }

    calcularPaginacion() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.cuentasPaginadas = this.cuentasFiltradas.slice(start, end);
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
        this.currentCuentaId = null;
        this.formData = {
            numero_cuenta: '',
            descripcion: '',
            nivel: 1,
            id_grupo_cuenta_contable: 0,
            estado: true
        };
        this.showForm = true;
    }

    abrirFormularioEditar(cuenta: CuentaContable) {
        this.isEditing = true;
        this.currentCuentaId = cuenta.id_cuenta_contable;
        this.formData = {
            numero_cuenta: cuenta.numero_cuenta,
            descripcion: cuenta.descripcion,
            nivel: cuenta.nivel,
            id_grupo_cuenta_contable: cuenta.id_grupo_cuenta_contable,
            estado: cuenta.estado !== undefined ? cuenta.estado : true
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.currentCuentaId = null;
    }

    guardarCuenta() {
        // Validaciones
        if (!this.formData.numero_cuenta || this.formData.numero_cuenta.trim() === '') {
            Swal.fire('Error', 'El número de cuenta es requerido', 'warning');
            return;
        }

        if (!this.formData.descripcion || this.formData.descripcion.trim() === '') {
            Swal.fire('Error', 'La descripción es requerida', 'warning');
            return;
        }

        if (!this.formData.nivel || this.formData.nivel < 1) {
            Swal.fire('Error', 'El nivel debe ser mayor o igual a 1', 'warning');
            return;
        }

        if (!this.formData.id_grupo_cuenta_contable || this.formData.id_grupo_cuenta_contable === 0) {
            Swal.fire('Error', 'Debe seleccionar un grupo de cuenta contable', 'warning');
            return;
        }

        // Validar que el número de cuenta solo contenga dígitos
        if (!/^\d+$/.test(this.formData.numero_cuenta)) {
            Swal.fire('Error', 'El número de cuenta debe contener solo dígitos numéricos', 'warning');
            return;
        }

        if (this.formData.numero_cuenta.length > 9) {
            Swal.fire('Error', 'El número de cuenta no puede exceder 9 dígitos', 'warning');
            return;
        }

        if (this.formData.numero_cuenta.length > 9) {
            Swal.fire('Error', 'El número de cuenta no puede exceder 9 dígitos', 'warning');
            return;
        }

        if (this.formData.descripcion.length > 250) {
            Swal.fire('Error', 'La descripción no puede exceder 250 caracteres', 'warning');
            return;
        }

        // Asegurar que los campos numéricos sean enviados como números
        const dataToSend: CreateCuentaContableDto = {
            ...this.formData,
            nivel: Number(this.formData.nivel),
            id_grupo_cuenta_contable: Number(this.formData.id_grupo_cuenta_contable)
        };

        if (this.isEditing && this.currentCuentaId) {
            // Actualizar
            this.cuentaContableService.update(this.currentCuentaId, dataToSend).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Cuenta contable actualizada correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error actualizando cuenta:', error);
                    const errorMessage = error.error?.message
                        ? (Array.isArray(error.error.message) ? error.error.message.join(', ') : error.error.message)
                        : 'Error al actualizar la cuenta contable';
                    Swal.fire('Error', errorMessage, 'error');
                }
            });
        } else {
            // Crear
            this.cuentaContableService.create(dataToSend).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Cuenta contable creada correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (error: any) => {
                    console.error('Error creando cuenta:', error);
                    const errorMessage = error.error?.message
                        ? (Array.isArray(error.error.message) ? error.error.message.join(', ') : error.error.message)
                        : 'Error al crear la cuenta contable';
                    Swal.fire('Error', errorMessage, 'error');
                }
            });
        }
    }

    // Validar que solo se ingresen números
    validarSoloNumeros(event: any) {
        const input = event.target as HTMLInputElement;
        // Remover cualquier carácter que no sea número
        input.value = input.value.replace(/[^0-9]/g, '');
        this.formData.numero_cuenta = input.value;
    }

    // Formatear número de cuenta con ceros a la izquierda
    formatearNumeroCuenta() {
        if (this.formData.numero_cuenta && this.formData.numero_cuenta.trim() !== '') {
            // Remover espacios y caracteres no numéricos
            let numero = this.formData.numero_cuenta.replace(/[^0-9]/g, '');

            // Limitar a 9 dígitos
            if (numero.length > 9) {
                numero = numero.substring(0, 9);
            }

            // Rellenar con ceros a la izquierda hasta completar 9 dígitos
            this.formData.numero_cuenta = numero.padStart(9, '0');
        }
    }

    eliminarCuenta(cuenta: CuentaContable) {
        Swal.fire({
            title: '¿Eliminar Cuenta?',
            text: `¿Estás seguro de eliminar la cuenta "${cuenta.numero_cuenta} - ${cuenta.descripcion}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.cuentaContableService.delete(cuenta.id_cuenta_contable).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Cuenta contable eliminada correctamente', 'success');
                        this.cargarDatos();
                    },
                    error: (error: any) => {
                        console.error('Error eliminando cuenta:', error);
                        Swal.fire('Error', 'Error al eliminar la cuenta contable', 'error');
                    }
                });
            }
        });
    }
}
