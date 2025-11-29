import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario, CreateUsuarioDto, UpdateUsuarioDto } from '../../../../../services/usuario.service';
import { UsuarioRolService } from '../../../../../services/usuario-rol.service';
import { RolService, Rol } from '../../../../../services/rol.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './usuarios.html',
    styleUrl: './usuarios.css'
})
export class Usuarios implements OnInit {
    usuarios: Usuario[] = [];
    roles: Rol[] = [];
    usuarioSeleccionado: Usuario | null = null;
    rolesAsignados: number[] = []; // IDs de roles asignados al usuario seleccionado

    // Formulario
    formulario = {
        id_usuario: 0,
        nombre: '',
        apellido: '',
        alias: '',
        clave: '',
        confirmarClave: '',
        cedula: '',
        telefono: '',
        direccion: '',
        estado: true
    };

    // Paginación y búsqueda
    searchTerm = '';
    currentPage = 1;
    itemsPerPage = 8;

    // Estados
    loading = false;
    guardando = false;
    modoEdicion = false;

    // Exponer Math para el template
    Math = Math;

    // Permisos
    canWrite = false;
    canDelete = false;

    constructor(
        private usuarioService: UsuarioService,
        private usuarioRolService: UsuarioRolService,
        private rolService: RolService,
        private permissionService: PermissionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        // Cargar permisos para esta ruta
        this.canWrite = this.permissionService.canWrite();
        this.canDelete = this.permissionService.canDelete();

        this.cargarDatos();
    }

    cargarDatos(): void {
        this.loading = true;
        Promise.all([
            this.usuarioService.getAll().toPromise(),
            this.rolService.getAll().toPromise()
        ])
            .then(([usuarios, roles]) => {
                this.usuarios = (usuarios || []).sort((a, b) => a.nombre.localeCompare(b.nombre));
                this.roles = (roles || []).filter(r => r.estado);
                this.loading = false;
                this.cdr.detectChanges();
            })
            .catch(err => {
                console.error('Error al cargar datos:', err);
                Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
                this.loading = false;
            });
    }

    get usuariosFiltrados(): Usuario[] {
        if (!this.searchTerm) return this.usuarios;
        const term = this.searchTerm.toLowerCase();
        return this.usuarios.filter(u =>
            u.nombre.toLowerCase().includes(term) ||
            u.apellido.toLowerCase().includes(term) ||
            u.alias.toLowerCase().includes(term) ||
            (u.cedula || '').toLowerCase().includes(term)
        );
    }

    get usuariosPaginados(): Usuario[] {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.usuariosFiltrados.slice(start, end);
    }

    get totalPages(): number {
        return Math.ceil(this.usuariosFiltrados.length / this.itemsPerPage);
    }

    cambiarPagina(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    getPaginationArray(): number[] {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    abrirModal(usuario?: Usuario): void {
        this.modoEdicion = !!usuario;
        this.rolesAsignados = [];

        if (usuario) {
            this.formulario = {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                alias: usuario.alias,
                clave: '',
                confirmarClave: '',
                cedula: usuario.cedula || '',
                telefono: usuario.telefono || '',
                direccion: usuario.direccion || '',
                estado: usuario.estado
            };
            this.usuarioSeleccionado = usuario;
            this.cargarRolesAsignados(usuario.id_usuario);
        } else {
            this.resetFormulario();
            this.usuarioSeleccionado = null;
        }

        const modal = document.getElementById('usuarioModal');
        if (modal) {
            const bsModal = new (window as any).bootstrap.Modal(modal);
            bsModal.show();
        }
    }

    resetFormulario(): void {
        this.formulario = {
            id_usuario: 0,
            nombre: '',
            apellido: '',
            alias: '',
            clave: '',
            confirmarClave: '',
            cedula: '',
            telefono: '',
            direccion: '',
            estado: true
        };
        this.rolesAsignados = [];
    }

    cargarRolesAsignados(idUsuario: number): void {
        this.usuarioRolService.getRolesByUsuario(idUsuario).subscribe({
            next: (usuarioRoles) => {
                this.rolesAsignados = usuarioRoles.map(ur => ur.id_rol);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error al cargar roles asignados:', err);
            }
        });
    }

    toggleRol(idRol: number): void {
        const index = this.rolesAsignados.indexOf(idRol);
        if (index > -1) {
            this.rolesAsignados.splice(index, 1);
        } else {
            this.rolesAsignados.push(idRol);
        }
    }

    validarFormulario(): boolean {
        if (!this.formulario.nombre.trim()) {
            Swal.fire('Error', 'El nombre es obligatorio', 'error');
            return false;
        }
        if (!this.formulario.apellido.trim()) {
            Swal.fire('Error', 'El apellido es obligatorio', 'error');
            return false;
        }
        if (!this.formulario.alias.trim()) {
            Swal.fire('Error', 'El alias es obligatorio', 'error');
            return false;
        }
        if (!this.modoEdicion && !this.formulario.clave) {
            Swal.fire('Error', 'La contraseña es obligatoria', 'error');
            return false;
        }
        if (this.formulario.clave && this.formulario.clave.length < 6) {
            Swal.fire('Error', 'La contraseña debe tener al menos 6 caracteres', 'error');
            return false;
        }
        if (this.formulario.clave !== this.formulario.confirmarClave) {
            Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
            return false;
        }
        return true;
    }

    async guardar(): Promise<void> {
        if (!this.validarFormulario()) return;

        this.guardando = true;

        try {
            let usuarioGuardado: Usuario;

            if (this.modoEdicion) {
                const updateData: UpdateUsuarioDto = {
                    nombre: this.formulario.nombre,
                    apellido: this.formulario.apellido,
                    alias: this.formulario.alias,
                    cedula: this.formulario.cedula || undefined,
                    telefono: this.formulario.telefono || undefined,
                    direccion: this.formulario.direccion || undefined,
                    estado: this.formulario.estado
                };
                if (this.formulario.clave) {
                    updateData.clave = this.formulario.clave;
                }
                usuarioGuardado = await this.usuarioService.update(this.formulario.id_usuario, updateData).toPromise() as Usuario;
            } else {
                const createData: CreateUsuarioDto = {
                    nombre: this.formulario.nombre,
                    apellido: this.formulario.apellido,
                    alias: this.formulario.alias,
                    clave: this.formulario.clave,
                    cedula: this.formulario.cedula || undefined,
                    telefono: this.formulario.telefono || undefined,
                    direccion: this.formulario.direccion || undefined,
                    estado: this.formulario.estado
                };
                usuarioGuardado = await this.usuarioService.create(createData).toPromise() as Usuario;
            }

            // Actualizar roles asignados
            await this.actualizarRolesAsignados(usuarioGuardado.id_usuario);

            Swal.fire('Éxito', `Usuario ${this.modoEdicion ? 'actualizado' : 'creado'} correctamente`, 'success');
            this.cargarDatos();
            this.cerrarModal();
        } catch (error: any) {
            console.error('Error al guardar usuario:', error);
            Swal.fire('Error', error.error?.message || 'No se pudo guardar el usuario', 'error');
        } finally {
            this.guardando = false;
        }
    }

    async actualizarRolesAsignados(idUsuario: number): Promise<void> {
        // Obtener roles actuales
        const rolesActuales = await this.usuarioRolService.getRolesByUsuario(idUsuario).toPromise() || [];
        const idsRolesActuales = rolesActuales.map(r => r.id_rol);

        // Roles a agregar
        const rolesAgregar = this.rolesAsignados.filter(id => !idsRolesActuales.includes(id));
        // Roles a eliminar
        const rolesEliminar = idsRolesActuales.filter(id => !this.rolesAsignados.includes(id));

        // Agregar nuevos roles
        for (const idRol of rolesAgregar) {
            await this.usuarioRolService.assign({ id_usuario: idUsuario, id_rol: idRol }).toPromise();
        }

        // Eliminar roles no seleccionados
        for (const idRol of rolesEliminar) {
            await this.usuarioRolService.remove(idUsuario, idRol).toPromise();
        }
    }

    eliminar(usuario: Usuario): void {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `Se desactivará el usuario ${usuario.nombre} ${usuario.apellido}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, desactivar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.usuarioService.delete(usuario.id_usuario).subscribe({
                    next: () => {
                        Swal.fire('Desactivado', 'El usuario ha sido desactivado', 'success');
                        this.cargarDatos();
                    },
                    error: (error) => {
                        console.error('Error al eliminar usuario:', error);
                        Swal.fire('Error', 'No se pudo desactivar el usuario', 'error');
                    }
                });
            }
        });
    }

    cerrarModal(): void {
        const modal = document.getElementById('usuarioModal');
        if (modal) {
            const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        }
        this.resetFormulario();
    }
}
