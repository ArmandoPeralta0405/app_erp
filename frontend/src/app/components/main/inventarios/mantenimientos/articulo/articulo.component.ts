import { Component, OnInit, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticuloService, Articulo, CreateArticuloDto } from '../../../../../services/articulo.service';
import { ArticuloCodigoBarraService, CreateArticuloCodigoBarraDto } from '../../../../../services/articulo-codigo-barra.service';
import { LineaService } from '../../../../../services/linea.service';
import { Tipo_articuloService } from '../../../../../services/tipo_articulo.service';
import { MarcaService } from '../../../../../services/marca.service';
import { UnidadMedidaService } from '../../../../../services/unidad-medida.service';
import { PermissionService } from '../../../../../services/permission.service';
import { ImpuestoService } from '../../../../../services/impuesto.service';
import Swal from 'sweetalert2';
import JsBarcode from 'jsbarcode';

@Component({
    selector: 'app-articulo',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './articulo.component.html',
    styleUrls: ['./articulo.component.css']
})
export class ArticuloComponent implements OnInit {
    articulos: Articulo[] = [];
    articulosFiltrados: Articulo[] = [];
    loading = true;
    searchTerm = '';

    // Catálogos
    lineas: any[] = [];
    tiposArticulo: any[] = [];
    marcas: any[] = [];
    unidadesMedida: any[] = [];
    impuestos: any[] = [];

    tiposCodigoBarra = [
        { valor: 'CODE128', nombre: 'Code 128' },
        { valor: 'EAN13', nombre: 'EAN-13' },
        { valor: 'UPC', nombre: 'UPC' },
        { valor: 'CODE39', nombre: 'Code 39' },
        { valor: 'ITF14', nombre: 'ITF-14' },
        { valor: 'MSI', nombre: 'MSI' },
        { valor: 'PHARMACODE', nombre: 'Pharmacode' }
    ];

    // Códigos de Barra
    codigosBarra: any[] = [];
    nuevoCodigo: CreateArticuloCodigoBarraDto = {
        id_articulo: 0,
        codigo_barra: '',
        tipo_codigo_barra: 'CODE128',
        id_unidad_medida: 0,
        es_principal: false,
        estado: true
    };

    // Paginación
    currentPage = 1;
    itemsPerPage = 8;
    totalPages = 0;
    pages: number[] = [];
    unidadesPaginadas: Articulo[] = [];

    // Formulario Modal
    showForm = false;
    isEditing = false;
    selectedId: number | null = null;
    formData: CreateArticuloDto = {
        nombre: '',
        codigo_alfanumerico: '',
        referencia: '',
        descripcion: '',
        id_linea: undefined,
        id_tipo_articulo: undefined,
        id_marca: undefined,
        id_unidad_medida: 0,
        id_impuesto: undefined,
        estado: true
    };

    // Permisos
    canWrite = false;
    canDelete = false;

    constructor(
        private articuloService: ArticuloService,
        private articuloCodigoBarraService: ArticuloCodigoBarraService,
        private lineaService: LineaService,
        private tipoArticuloService: Tipo_articuloService,
        private marcaService: MarcaService,
        private unidadMedidaService: UnidadMedidaService,
        private impuestoService: ImpuestoService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        // Cargar permisos para esta ruta
        const currentRoute = '/inventarios/mantenimientos/articulos';
        this.canWrite = this.permissionService.canWrite(currentRoute);
        this.canDelete = this.permissionService.canDelete(currentRoute);

        this.cargarDatos();
        this.cargarCatalogos();
    }

    cargarDatos() {
        this.loading = true;
        this.articuloService.getAll().subscribe({
            next: (data) => {
                this.articulos = data;
                this.filtrar();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error cargando artículos', err);
                this.loading = false;
                this.cdr.detectChanges();
                if (err.status !== 404) {
                    Swal.fire('Error', 'No se pudieron cargar los artículos', 'error');
                }
            }
        });
    }

    cargarCatalogos() {
        this.lineaService.getAll().subscribe((data: any[]) => this.lineas = data);
        this.tipoArticuloService.getAll().subscribe((data: any[]) => this.tiposArticulo = data);
        this.marcaService.getAll().subscribe((data: any[]) => this.marcas = data);
        this.unidadMedidaService.getAll().subscribe((data: any[]) => this.unidadesMedida = data);
        this.impuestoService.getAll().subscribe((data: any[]) => this.impuestos = data);
    }

    cargarCodigosBarra(idArticulo: number) {
        this.articuloCodigoBarraService.getByArticulo(idArticulo).subscribe({
            next: (data) => {
                this.codigosBarra = data;
                this.cdr.detectChanges();
                // Wait for modal and DOM to be ready
                setTimeout(() => this.renderizarCodigosBarra(), 300);
            },
            error: (err) => {
                console.error('Error cargando códigos', err);
                this.codigosBarra = [];
                this.cdr.detectChanges();
            }
        });
    }

    filtrar() {
        if (!this.searchTerm) {
            this.articulosFiltrados = this.articulos;
        } else {
            const term = this.searchTerm.toLowerCase();
            this.articulosFiltrados = this.articulos.filter(a =>
                a.nombre.toLowerCase().includes(term) ||
                (a.codigo_alfanumerico && a.codigo_alfanumerico.toLowerCase().includes(term)) ||
                (a.referencia && a.referencia.toLowerCase().includes(term))
            );
        }
        this.calcularPaginacion();
    }

    onSearch() {
        this.currentPage = 1;
        this.filtrar();
    }

    calcularPaginacion() {
        this.totalPages = Math.ceil(this.articulosFiltrados.length / this.itemsPerPage);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.actualizarPagina();
    }

    actualizarPagina() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.unidadesPaginadas = this.articulosFiltrados.slice(start, end);
    }

    cambiarPagina(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.actualizarPagina();
        }
    }

    eliminar(articulo: Articulo) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `Se eliminará el artículo "${articulo.nombre}"`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.articuloService.delete(articulo.id_articulo).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'El artículo ha sido eliminado.', 'success');
                        this.cargarDatos();
                    },
                    error: (err) => {
                        console.error(err);
                        Swal.fire('Error', 'No se pudo eliminar el artículo', 'error');
                    }
                });
            }
        });
    }

    // Formulario
    abrirFormularioNuevo() {
        this.isEditing = false;
        this.selectedId = null;
        this.codigosBarra = [];
        this.formData = {
            nombre: '',
            codigo_alfanumerico: '',
            referencia: '',
            descripcion: '',
            id_linea: undefined,
            id_tipo_articulo: undefined,
            id_marca: undefined,
            id_unidad_medida: 0,
            id_impuesto: undefined,
            estado: true
        };
        // Pre-seleccionar primera unidad si existe
        if (this.unidadesMedida.length > 0) {
            this.formData.id_unidad_medida = this.unidadesMedida[0].id_unidad_medida;
        }
        this.showForm = true;
    }

    abrirFormularioEditar(articulo: Articulo) {
        this.isEditing = true;
        this.selectedId = articulo.id_articulo;
        this.formData = {
            nombre: articulo.nombre,
            codigo_alfanumerico: articulo.codigo_alfanumerico,
            referencia: articulo.referencia,
            descripcion: articulo.descripcion,
            id_linea: articulo.id_linea,
            id_tipo_articulo: articulo.id_tipo_articulo,
            id_marca: articulo.id_marca,
            id_unidad_medida: articulo.id_unidad_medida,
            id_impuesto: articulo.id_impuesto,
            estado: articulo.estado
        };
        this.cargarCodigosBarra(articulo.id_articulo);
        this.resetNuevoCodigo();
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
    }

    guardar() {
        if (!this.formData.nombre || !this.formData.id_unidad_medida) {
            Swal.fire('Error', 'Nombre y Unidad de Medida son obligatorios', 'error');
            return;
        }

        // Convertir strings vacíos a undefined o null si es necesario
        // NestJS DTO espera numbers, asegurarse de conversión
        const payload: any = { ...this.formData };
        payload.id_linea = payload.id_linea ? Number(payload.id_linea) : undefined;
        payload.id_tipo_articulo = payload.id_tipo_articulo ? Number(payload.id_tipo_articulo) : undefined;
        payload.id_marca = payload.id_marca ? Number(payload.id_marca) : undefined;
        payload.id_unidad_medida = Number(payload.id_unidad_medida);
        payload.id_impuesto = payload.id_impuesto ? Number(payload.id_impuesto) : undefined;

        if (this.isEditing && this.selectedId) {
            this.articuloService.update(this.selectedId, payload).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Artículo actualizado correctamente', 'success');
                    this.cerrarFormulario();
                    this.cargarDatos();
                },
                error: (err) => {
                    console.error(err);
                    Swal.fire('Error', 'No se pudo actualizar el artículo', 'error');
                }
            });
        } else {
            this.articuloService.create(payload).subscribe({
                next: (res) => {
                    Swal.fire({
                        title: 'Éxito',
                        text: 'Artículo creado. ¿Desea agregar códigos de barra ahora?',
                        icon: 'success',
                        showCancelButton: true,
                        confirmButtonText: 'Sí, agregar códigos',
                        cancelButtonText: 'No, cerrar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            this.abrirFormularioEditar(res);
                        } else {
                            this.cerrarFormulario();
                            this.cargarDatos();
                        }
                    });
                },
                error: (err) => {
                    console.error(err);
                    Swal.fire('Error', 'No se pudo crear el artículo', 'error');
                }
            });
        }
    }

    // Gestión de Códigos de Barra
    resetNuevoCodigo() {
        this.nuevoCodigo = {
            id_articulo: this.selectedId || 0,
            codigo_barra: '',
            tipo_codigo_barra: 'CODE128',
            id_unidad_medida: this.formData.id_unidad_medida || 0,
            es_principal: false,
            estado: true
        };
        // Pre-seleccionar la unidad del artículo por defecto
        if (this.formData.id_unidad_medida) {
            this.nuevoCodigo.id_unidad_medida = this.formData.id_unidad_medida;
        }
    }

    agregarCodigo() {
        if (!this.selectedId) return;
        if (!this.nuevoCodigo.codigo_barra) {
            Swal.fire('Error', 'El código de barra es obligatorio', 'warning');
            return;
        }

        this.nuevoCodigo.id_articulo = this.selectedId;
        this.nuevoCodigo.id_unidad_medida = Number(this.nuevoCodigo.id_unidad_medida);

        this.articuloCodigoBarraService.create(this.nuevoCodigo).subscribe({
            next: () => {
                this.cargarCodigosBarra(this.selectedId!);
                this.resetNuevoCodigo();
                Swal.fire({
                    icon: 'success',
                    title: 'Agregado',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000
                });
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(err);
                Swal.fire('Error', 'No se pudo agregar el código. Verifique que no esté duplicado.', 'error');
                this.cdr.detectChanges();
            }
        });
    }

    eliminarCodigo(codigo: any) {
        if (!this.selectedId) return;

        Swal.fire({
            title: '¿Eliminar código?',
            text: codigo.codigo_barra,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.articuloCodigoBarraService.delete(this.selectedId!, codigo.codigo_barra).subscribe({
                    next: () => {
                        this.cargarCodigosBarra(this.selectedId!);
                    },
                    error: (err) => {
                        console.error(err);
                        Swal.fire('Error', 'No se pudo eliminar el código', 'error');
                    }
                });
            }
        });
    }
    renderizarCodigosBarra() {
        if (!this.codigosBarra || this.codigosBarra.length === 0) return;

        // Ensure DOM is updated before trying to find elements
        this.cdr.detectChanges();

        this.codigosBarra.forEach(cb => {
            try {
                const elementId = `#barcode-${cb.codigo_barra}`;
                // Check if element exists before trying to render
                if (document.querySelector(elementId)) {
                    let value = cb.codigo_barra;
                    const format = cb.tipo_codigo_barra || 'CODE128';

                    // Limpieza de datos según el formato
                    if (format === 'ITF14') {
                        // Eliminar espacios
                        value = value.replace(/\s/g, '');
                    } else if (format === 'CODE39') {
                        // Eliminar asteriscos (JsBarcode los agrega si es necesario o los ignora, pero mejor limpiar)
                        value = value.replace(/\*/g, '');
                    } else if (format === 'UPC') {
                        // UPC-A requiere 12 dígitos. Si tiene 13 y empieza con 0, quitar el 0 inicial.
                        if (value.length === 13 && value.startsWith('0')) {
                            value = value.substring(1);
                        }
                    }

                    JsBarcode(elementId, value, {
                        format: format,
                        lineColor: "#000",
                        width: 1,
                        height: 30,
                        displayValue: false,
                        valid: (valid) => {
                            if (!valid) {
                                console.warn(`Datos inválidos para formato ${format}: ${value}`);
                                // Fallback visual o manejo de error si se desea
                            }
                        }
                    });
                } else {
                    console.warn(`Elemento ${elementId} no encontrado para renderizar código`);
                }
            } catch (e) {
                console.warn(`No se pudo renderizar código ${cb.codigo_barra}`, e);
            }
        });
    }
}
