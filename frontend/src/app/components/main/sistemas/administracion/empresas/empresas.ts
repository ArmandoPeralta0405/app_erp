import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpresaService, Empresa, CreateEmpresaDto, UpdateEmpresaDto } from '../../../../../services/empresa.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-empresas',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './empresas.html',
    styleUrl: './empresas.css'
})
export class Empresas implements OnInit {
    empresas: Empresa[] = [];
    empresasFiltradas: Empresa[] = [];
    empresasPaginadas: Empresa[] = [];
    loading = false;
    showForm = false;
    isEditing = false;
    calculandoDV = false;

    // Búsqueda y paginación
    searchTerm = '';
    currentPage = 1;
    itemsPerPage = 8;
    totalPages = 1;
    pages: number[] = [];

    // Permisos
    canWrite = false;
    canDelete = false;

    // Formulario
    formData: CreateEmpresaDto | UpdateEmpresaDto = {
        razon_social: '',
        ruc: '',
        dv: '',
        telefono: '',
        direccion: '',
        correo: '',
        estado: true
    };
    selectedEmpresaId: number | null = null;

    // Exponer Math al template
    Math = Math;

    constructor(
        private empresaService: EmpresaService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        const currentRoute = '/sistemas/administracion/empresas';
        this.canWrite = this.permissionService.canWrite(currentRoute);
        this.canDelete = this.permissionService.canDelete(currentRoute);

        this.cargarEmpresas();
    }

    cargarEmpresas() {
        this.loading = true;
        this.empresaService.getAll().subscribe({
            next: (data) => {
                this.empresas = data;
                this.empresasFiltradas = data;
                this.calcularPaginacion();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error cargando empresas:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar las empresas',
                    confirmButtonColor: '#003366'
                });
                this.loading = false;
            }
        });
    }

    onSearch() {
        const term = this.searchTerm.toLowerCase().trim();
        if (!term) {
            this.empresasFiltradas = this.empresas;
        } else {
            this.empresasFiltradas = this.empresas.filter(empresa =>
                empresa.razon_social.toLowerCase().includes(term) ||
                empresa.ruc.toLowerCase().includes(term) ||
                (empresa.correo && empresa.correo.toLowerCase().includes(term))
            );
        }
        this.calcularPaginacion();
    }

    calcularPaginacion() {
        this.totalPages = Math.ceil(this.empresasFiltradas.length / this.itemsPerPage);
        this.pages = this.getPaginationArray();
        this.actualizarPaginaActual();
    }

    getPaginationArray(): number[] {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    actualizarPaginaActual() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.empresasPaginadas = this.empresasFiltradas.slice(startIndex, endIndex);
    }

    cambiarPagina(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.actualizarPaginaActual();
        }
    }

    abrirFormularioNuevo() {
        this.isEditing = false;
        this.selectedEmpresaId = null;
        this.formData = {
            razon_social: '',
            ruc: '',
            dv: '',
            telefono: '',
            direccion: '',
            correo: '',
            estado: true
        };
        this.showForm = true;
    }

    abrirFormularioEditar(empresa: Empresa) {
        this.isEditing = true;
        this.selectedEmpresaId = empresa.id_empresa;
        this.formData = {
            razon_social: empresa.razon_social,
            ruc: empresa.ruc,
            dv: empresa.dv,
            telefono: empresa.telefono || '',
            direccion: empresa.direccion || '',
            correo: empresa.correo || '',
            estado: empresa.estado
        };
        this.showForm = true;
    }

    cerrarFormulario() {
        this.showForm = false;
        this.isEditing = false;
        this.selectedEmpresaId = null;
        this.formData = {
            razon_social: '',
            ruc: '',
            dv: '',
            telefono: '',
            direccion: '',
            correo: '',
            estado: true
        };
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
        this.empresaService.calcularDV(this.formData.ruc).subscribe({
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

    guardarEmpresa() {
        // Validaciones
        if (!this.formData.razon_social || !this.formData.ruc || !this.formData.dv) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor complete razón social, RUC y dígito verificador',
                confirmButtonColor: '#003366'
            });
            return;
        }

        // Validar email si está presente
        if (this.formData.correo && this.formData.correo.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.formData.correo)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Email inválido',
                    text: 'Por favor ingrese un email válido',
                    confirmButtonColor: '#003366'
                });
                return;
            }
        }

        // Convertir strings vacíos a undefined para campos opcionales
        const dataToSend = {
            ...this.formData,
            telefono: this.formData.telefono?.trim() || undefined,
            direccion: this.formData.direccion?.trim() || undefined,
            correo: this.formData.correo?.trim() || undefined
        };

        if (this.isEditing && this.selectedEmpresaId) {
            // Actualizar
            this.empresaService.update(this.selectedEmpresaId, dataToSend).subscribe({
                next: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Actualizado',
                        text: 'Empresa actualizada correctamente',
                        confirmButtonColor: '#003366',
                        timer: 2000
                    });
                    this.cerrarFormulario();
                    this.cargarEmpresas();
                },
                error: (error) => {
                    console.error('Error actualizando empresa:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.error?.message || 'No se pudo actualizar la empresa',
                        confirmButtonColor: '#003366'
                    });
                }
            });
        } else {
            // Crear
            this.empresaService.create(dataToSend as CreateEmpresaDto).subscribe({
                next: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Creado',
                        text: 'Empresa creada correctamente',
                        confirmButtonColor: '#003366',
                        timer: 2000
                    });
                    this.cerrarFormulario();
                    this.cargarEmpresas();
                },
                error: (error) => {
                    console.error('Error creando empresa:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.error?.message || 'No se pudo crear la empresa',
                        confirmButtonColor: '#003366'
                    });
                }
            });
        }
    }

    eliminarEmpresa(empresa: Empresa) {
        Swal.fire({
            title: '¿Eliminar empresa?',
            text: `¿Está seguro de eliminar la empresa "${empresa.razon_social}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.empresaService.delete(empresa.id_empresa).subscribe({
                    next: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Eliminado',
                            text: 'Empresa eliminada correctamente',
                            confirmButtonColor: '#003366',
                            timer: 2000
                        });
                        this.cargarEmpresas();
                    },
                    error: (error) => {
                        console.error('Error eliminando empresa:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: error.error?.message || 'No se pudo eliminar la empresa',
                            confirmButtonColor: '#003366'
                        });
                    }
                });
            }
        });
    }
}
