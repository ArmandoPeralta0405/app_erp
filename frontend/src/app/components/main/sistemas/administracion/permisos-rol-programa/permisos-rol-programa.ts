import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { RolProgramaService, RolPrograma } from '../../../../../services/rol-programa.service';
import { RolService, Rol } from '../../../../../services/rol.service';
import { ProgramaService, Programa } from '../../../../../services/programa.service';
import Swal from 'sweetalert2';

/** Extiende la interfaz Programa del backend añadiendo los campos de permisos */
interface ProgramaConPermisos extends Programa {
    acceso_lectura: boolean;
    acceso_escritura: boolean;
    acceso_eliminacion: boolean;
    tienePermiso: boolean;
}

@Component({
    selector: 'app-permisos-rol-programa',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './permisos-rol-programa.html',
    styleUrl: './permisos-rol-programa.css'
})
export class PermisosRolProgramaComponent implements OnInit {
    /** Datos del backend */
    roles: Rol[] = [];
    programas: Programa[] = [];
    permisos: RolPrograma[] = [];
    programasConPermisos: ProgramaConPermisos[] = [];

    /** Estado UI */
    rolSeleccionado: Rol | null = null;
    searchTerm = '';
    loading = false;
    guardando = false;

    /** Paginación */
    currentPage = 1;
    itemsPerPage = 5;
    totalPages = 1;
    pages: number[] = [];

    /** Exponer Math al template */
    Math = Math;

    constructor(
        private rolProgramaService: RolProgramaService,
        private rolService: RolService,
        private programaService: ProgramaService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.cargarDatos();
    }

    /** Carga roles, programas y permisos desde el backend */
    cargarDatos(): void {
        this.loading = true;
        Promise.all([
            this.rolService.getAll().toPromise(),
            this.programaService.getAll().toPromise(),
            this.rolProgramaService.getAll().toPromise()
        ])
            .then(([roles, programas, permisos]) => {
                this.roles = (roles || []).filter((r: Rol) => r.estado);
                this.programas = (programas || []).filter((p: Programa) => p.estado);
                this.permisos = permisos || [];
                this.loading = false;
                this.cdr.detectChanges();
            })
            .catch(err => {
                console.error('Error al cargar datos:', err);
                Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
                this.loading = false;
            });
    }

    /** Cuando el usuario elige un rol */
    seleccionarRol(rol: Rol): void {
        this.rolSeleccionado = rol;
        this.actualizarProgramasConPermisos();
    }

    /** Construye la lista de programas con sus permisos para el rol activo */
    actualizarProgramasConPermisos(): void {
        if (!this.rolSeleccionado) {
            this.programasConPermisos = [];
            return;
        }
        this.programasConPermisos = this.programas.map(programa => {
            const permiso = this.permisos.find(
                p => p.id_rol === this.rolSeleccionado!.id_rol && p.id_programa === programa.id_programa
            );
            return {
                ...programa,
                acceso_lectura: permiso?.acceso_lectura || false,
                acceso_escritura: permiso?.acceso_escritura || false,
                acceso_eliminacion: permiso?.acceso_eliminacion || false,
                tienePermiso: !!permiso
            } as ProgramaConPermisos;
        });
        this.currentPage = 1;
        this.calcularPaginacion();
    }

    /** Filtra la tabla según el término de búsqueda */
    get programasFiltrados(): ProgramaConPermisos[] {
        if (!this.searchTerm) return this.programasConPermisos;
        const term = this.searchTerm.toLowerCase();
        return this.programasConPermisos.filter(p =>
            p.titulo.toLowerCase().includes(term) ||
            p.codigo_alfanumerico.toLowerCase().includes(term) ||
            (p.modulo?.nombre || '').toLowerCase().includes(term) ||
            (p.categoria_programa?.nombre || '').toLowerCase().includes(term)
        );
    }

    /** Programas paginados */
    get programasPaginados(): ProgramaConPermisos[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.programasFiltrados.slice(startIndex, endIndex);
    }

    /** Calcula la paginación */
    calcularPaginacion(): void {
        this.totalPages = Math.ceil(this.programasFiltrados.length / this.itemsPerPage);
        // Si la página actual es mayor que el total, volver a la primera
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = 1;
        }
        this.pages = this.calcularPaginasVisibles();
    }

    calcularPaginasVisibles(): number[] {
        const maxPagesToShow = 5; // Máximo de páginas a mostrar
        const pages: number[] = [];

        if (this.totalPages <= maxPagesToShow + 2) {
            // Si hay pocas páginas, mostrar todas
            return Array.from({ length: this.totalPages }, (_, i) => i + 1);
        }

        // Siempre mostrar la primera página
        pages.push(1);

        // Calcular el rango alrededor de la página actual
        let startPage = Math.max(2, this.currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);

        // Ajustar si estamos cerca del final
        if (endPage === this.totalPages - 1) {
            startPage = Math.max(2, endPage - maxPagesToShow + 1);
        }

        // Agregar puntos suspensivos si hay salto
        if (startPage > 2) {
            pages.push(-1); // -1 representa "..."
        }

        // Agregar páginas del rango
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Agregar puntos suspensivos si hay salto al final
        if (endPage < this.totalPages - 1) {
            pages.push(-1); // -1 representa "..."
        }

        // Siempre mostrar la última página
        if (this.totalPages > 1) {
            pages.push(this.totalPages);
        }

        return pages;
    }

    /** Cambia de página */
    cambiarPagina(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.pages = this.calcularPaginasVisibles();
        }
    }

    /** Resetea la paginación al buscar */
    onSearch(): void {
        this.currentPage = 1;
        this.calcularPaginacion();
    }

    /** Alterna entre crear o eliminar un permiso */
    async togglePermiso(programa: ProgramaConPermisos): Promise<void> {
        if (!this.rolSeleccionado) return;
        this.guardando = true;
        try {
            if (programa.tienePermiso) {
                // Eliminar permiso
                await this.rolProgramaService
                    .delete(this.rolSeleccionado.id_rol, programa.id_programa)
                    .toPromise()
                    .catch(err => {
                        if (err.status === 404) {
                            console.warn('Permiso no encontrado (404) al intentar eliminar');
                        } else {
                            throw err;
                        }
                    });
                programa.tienePermiso = false;
                programa.acceso_lectura = false;
                programa.acceso_escritura = false;
                programa.acceso_eliminacion = false;
                this.permisos = this.permisos.filter(
                    p => !(p.id_rol === this.rolSeleccionado!.id_rol && p.id_programa === programa.id_programa)
                );
                Swal.fire('Eliminado', 'Permiso eliminado correctamente', 'success');
            } else {
                // Crear permiso
                const nuevo = await this.rolProgramaService
                    .create({
                        id_rol: this.rolSeleccionado.id_rol,
                        id_programa: programa.id_programa,
                        acceso_lectura: false,
                        acceso_escritura: false,
                        acceso_eliminacion: false
                    })
                    .toPromise();
                programa.tienePermiso = true;
                this.permisos.push(nuevo!);
                Swal.fire('Agregado', 'Permiso agregado correctamente', 'success');
            }
        } catch (e: any) {
            console.error('Error al toggle permiso:', e);
            Swal.fire('Error', e.error?.message || 'No se pudo modificar el permiso', 'error');
        } finally {
            this.guardando = false;
            this.cdr.detectChanges();
        }
    }

    /** Actualiza un permiso concreto (lectura, escritura o eliminación) */
    async actualizarAcceso(programa: ProgramaConPermisos, tipo: 'lectura' | 'escritura' | 'eliminacion'): Promise<void> {
        if (!this.rolSeleccionado || !programa.tienePermiso) return;
        this.guardando = true;
        try {
            const data: any = {};
            data[`acceso_${tipo}`] = programa[`acceso_${tipo}` as keyof ProgramaConPermisos];
            await this.rolProgramaService
                .update(this.rolSeleccionado.id_rol, programa.id_programa, data)
                .toPromise();
            const permiso = this.permisos.find(
                p => p.id_rol === this.rolSeleccionado!.id_rol && p.id_programa === programa.id_programa
            );
            if (permiso) (permiso as any)[`acceso_${tipo}`] = data[`acceso_${tipo}`];
        } catch (e: any) {
            console.error('Error al actualizar acceso:', e);
            Swal.fire('Error', e.error?.message || 'No se pudo actualizar el permiso', 'error');
            (programa as any)[`acceso_${tipo}`] = !(programa as any)[`acceso_${tipo}`];
        } finally {
            this.guardando = false;
            this.cdr.detectChanges();
        }
    }

    /** Cantidad de programas con permiso asignado */
    get totalProgramasConPermiso(): number {
        return this.programasConPermisos.filter(p => p.tienePermiso).length;
    }

    /** Habilitar todos los programas */
    async habilitarTodos(): Promise<void> {
        if (!this.rolSeleccionado) return;

        const result = await Swal.fire({
            title: '¿Habilitar todos los programas?',
            text: `Se asignarán todos los ${this.programas.length} programas al rol "${this.rolSeleccionado.nombre}"`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#003366',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, habilitar todos',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        this.guardando = true;
        let errores = 0;
        let creados = 0;

        for (const programa of this.programasConPermisos) {
            if (!programa.tienePermiso) {
                try {
                    const nuevo = await this.rolProgramaService
                        .create({
                            id_rol: this.rolSeleccionado.id_rol,
                            id_programa: programa.id_programa,
                            acceso_lectura: false,
                            acceso_escritura: false,
                            acceso_eliminacion: false
                        })
                        .toPromise();
                    programa.tienePermiso = true;
                    this.permisos.push(nuevo!);
                    creados++;
                } catch (e) {
                    console.error('Error creando permiso:', e);
                    errores++;
                }
            }
        }

        this.guardando = false;
        this.cdr.detectChanges();

        if (errores === 0) {
            Swal.fire('¡Completado!', `Se habilitaron ${creados} programas correctamente`, 'success');
        } else {
            Swal.fire('Completado con errores', `Se habilitaron ${creados} programas. ${errores} fallaron.`, 'warning');
        }
    }

    /** Deshabilitar todos los programas */
    async deshabilitarTodos(): Promise<void> {
        if (!this.rolSeleccionado) return;

        const result = await Swal.fire({
            title: '¿Deshabilitar todos los programas?',
            text: `Se eliminarán todos los permisos del rol "${this.rolSeleccionado.nombre}"`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, deshabilitar todos',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        this.guardando = true;
        let errores = 0;
        let eliminados = 0;

        for (const programa of this.programasConPermisos) {
            if (programa.tienePermiso) {
                try {
                    await this.rolProgramaService
                        .delete(this.rolSeleccionado.id_rol, programa.id_programa)
                        .toPromise()
                        .catch(err => {
                            if (err.status !== 404) throw err;
                        });
                    programa.tienePermiso = false;
                    programa.acceso_lectura = false;
                    programa.acceso_escritura = false;
                    programa.acceso_eliminacion = false;
                    this.permisos = this.permisos.filter(
                        p => !(p.id_rol === this.rolSeleccionado!.id_rol && p.id_programa === programa.id_programa)
                    );
                    eliminados++;
                } catch (e) {
                    console.error('Error eliminando permiso:', e);
                    errores++;
                }
            }
        }

        this.guardando = false;
        this.cdr.detectChanges();

        if (errores === 0) {
            Swal.fire('¡Completado!', `Se deshabilitaron ${eliminados} programas correctamente`, 'success');
        } else {
            Swal.fire('Completado con errores', `Se deshabilitaron ${eliminados} programas. ${errores} fallaron.`, 'warning');
        }
    }

    /** Habilitar lectura para todos los programas asignados */
    async habilitarLecturaTodos(): Promise<void> {
        await this.actualizarPermisoMasivo('lectura', true);
    }

    /** Deshabilitar lectura para todos los programas asignados */
    async deshabilitarLecturaTodos(): Promise<void> {
        await this.actualizarPermisoMasivo('lectura', false);
    }

    /** Habilitar escritura para todos los programas asignados */
    async habilitarEscrituraTodos(): Promise<void> {
        await this.actualizarPermisoMasivo('escritura', true);
    }

    /** Deshabilitar escritura para todos los programas asignados */
    async deshabilitarEscrituraTodos(): Promise<void> {
        await this.actualizarPermisoMasivo('escritura', false);
    }

    /** Habilitar eliminación para todos los programas asignados */
    async habilitarEliminacionTodos(): Promise<void> {
        await this.actualizarPermisoMasivo('eliminacion', true);
    }

    /** Deshabilitar eliminación para todos los programas asignados */
    async deshabilitarEliminacionTodos(): Promise<void> {
        await this.actualizarPermisoMasivo('eliminacion', false);
    }

    /** Método auxiliar para actualizar permisos masivamente */
    private async actualizarPermisoMasivo(tipo: 'lectura' | 'escritura' | 'eliminacion', valor: boolean): Promise<void> {
        if (!this.rolSeleccionado) return;

        const programasConPermiso = this.programasConPermisos.filter(p => p.tienePermiso);
        if (programasConPermiso.length === 0) {
            Swal.fire('Sin programas', 'No hay programas asignados a este rol', 'info');
            return;
        }

        const accion = valor ? 'habilitar' : 'deshabilitar';
        const tipoTexto = tipo === 'lectura' ? 'lectura' : tipo === 'escritura' ? 'escritura' : 'eliminación';

        const result = await Swal.fire({
            title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} ${tipoTexto} para todos?`,
            text: `Se ${accion}á el permiso de ${tipoTexto} para ${programasConPermiso.length} programas`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#003366',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        this.guardando = true;
        let errores = 0;
        let actualizados = 0;

        for (const programa of programasConPermiso) {
            try {
                const data: any = {};
                data[`acceso_${tipo}`] = valor;
                await this.rolProgramaService
                    .update(this.rolSeleccionado.id_rol, programa.id_programa, data)
                    .toPromise();
                (programa as any)[`acceso_${tipo}`] = valor;
                const permiso = this.permisos.find(
                    p => p.id_rol === this.rolSeleccionado!.id_rol && p.id_programa === programa.id_programa
                );
                if (permiso) (permiso as any)[`acceso_${tipo}`] = valor;
                actualizados++;
            } catch (e) {
                console.error('Error actualizando permiso:', e);
                errores++;
            }
        }

        this.guardando = false;
        this.cdr.detectChanges();

        if (errores === 0) {
            Swal.fire('¡Completado!', `Se actualizaron ${actualizados} programas correctamente`, 'success');
        } else {
            Swal.fire('Completado con errores', `Se actualizaron ${actualizados} programas. ${errores} fallaron.`, 'warning');
        }
    }
}
