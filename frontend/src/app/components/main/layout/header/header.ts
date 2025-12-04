import { Component, EventEmitter, Output, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { ConfiguracionSistemaService, ConfiguracionSistema } from '../../../../services/configuracion-sistema.service';
import { UsuarioConfiguracionSistemaService } from '../../../../services/usuario-configuracion-sistema.service';
import { TerminalService, Terminal } from '../../../../services/terminal.service';
import { UsuarioTerminalService } from '../../../../services/usuario-terminal.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-header',
    imports: [CommonModule, FormsModule],
    templateUrl: './header.html',
    styleUrl: './header.css',
})
export class Header implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>();

    // Datos del usuario
    userName: string = 'Usuario';
    userAlias: string = '';
    userId: number = 0;

    // Modal de configuración
    showConfigModal = false;
    loading = false;

    // Configuración del sistema
    configuraciones: ConfiguracionSistema[] = [];
    configuracionActual: ConfiguracionSistema | null = null;
    configuracionSeleccionada?: number;

    // Terminal
    terminales: Terminal[] = [];
    terminalActual: Terminal | null = null;
    terminalSeleccionada?: number;

    constructor(
        private router: Router,
        private authService: AuthService,
        private configuracionService: ConfiguracionSistemaService,
        private usuarioConfigService: UsuarioConfiguracionSistemaService,
        private terminalService: TerminalService,
        private usuarioTerminalService: UsuarioTerminalService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadUserData();
    }

    loadUserData() {
        const user = this.authService.getCurrentUser();
        if (user) {
            this.userId = user.id;
            const apellido = user.apellido ? ` ${user.apellido}` : '';
            this.userName = `${user.nombre}${apellido}`;
            this.userAlias = user.alias;
        }
    }

    onToggleSidebar() {
        this.toggleSidebar.emit();
    }

    abrirModalConfiguracion() {
        this.showConfigModal = true;
        this.loading = true;
        this.cdr.detectChanges();

        // Cargar datos en paralelo
        this.cargarConfiguraciones();
        this.cargarTerminales();
    }

    private cargarConfiguraciones() {
        this.configuracionService.getAll().subscribe({
            next: (configuraciones) => {
                this.configuraciones = (configuraciones || []).filter(c => c.estado);

                // Cargar configuración del usuario
                this.usuarioConfigService.getByUsuario(this.userId).subscribe({
                    next: (usuarioConfigs) => {
                        if (usuarioConfigs && usuarioConfigs.length > 0) {
                            const config = usuarioConfigs[0];
                            this.configuracionActual = config.configuracion_sistema as any;
                            this.configuracionSeleccionada = config.id_configuracion_sistema;
                        } else {
                            this.configuracionActual = null;
                            this.configuracionSeleccionada = undefined;
                        }
                        this.verificarCargaCompleta();
                    },
                    error: (error) => {
                        console.error('Error cargando configuración del usuario:', error);
                        this.configuracionActual = null;
                        this.configuracionSeleccionada = undefined;
                        this.verificarCargaCompleta();
                    }
                });
            },
            error: (error) => {
                console.error('Error cargando configuraciones:', error);
                this.verificarCargaCompleta();
                Swal.fire('Error', 'No se pudieron cargar las configuraciones', 'error');
            }
        });
    }

    private cargarTerminales() {
        this.terminalService.getAll().subscribe({
            next: (terminales) => {
                this.terminales = (terminales || []).filter(t => t.estado);

                // Cargar terminal del usuario
                this.usuarioTerminalService.getByUsuario(this.userId).subscribe({
                    next: (usuarioTerminales) => {
                        if (usuarioTerminales && usuarioTerminales.length > 0) {
                            const ut = usuarioTerminales[0];
                            this.terminalActual = ut.terminal || null;
                            this.terminalSeleccionada = ut.id_terminal;
                        } else {
                            this.terminalActual = null;
                            this.terminalSeleccionada = undefined;
                        }
                        this.verificarCargaCompleta();
                    },
                    error: (error) => {
                        console.error('Error cargando terminal del usuario:', error);
                        this.terminalActual = null;
                        this.terminalSeleccionada = undefined;
                        this.verificarCargaCompleta();
                    }
                });
            },
            error: (error) => {
                console.error('Error cargando terminales:', error);
                this.verificarCargaCompleta();
            }
        });
    }

    private cargasCompletadas = 0;
    private verificarCargaCompleta() {
        this.cargasCompletadas++;
        // 2 cargas: configuraciones + terminales (cada una con 2 requests)
        if (this.cargasCompletadas >= 2) {
            this.loading = false;
            this.cargasCompletadas = 0;
            this.cdr.detectChanges();
        }
    }

    cerrarModalConfiguracion() {
        this.showConfigModal = false;
        this.configuracionSeleccionada = undefined;
        this.terminalSeleccionada = undefined;
        this.cargasCompletadas = 0;
    }

    guardarConfiguracion() {
        if (!this.configuracionSeleccionada) {
            Swal.fire('Atención', 'Debe seleccionar una configuración', 'warning');
            return;
        }

        this.loading = true;
        this.cdr.detectChanges();

        if (this.configuracionActual) {
            this.usuarioConfigService.deleteAllByUsuario(this.userId).subscribe({
                next: () => {
                    this.crearNuevaConfiguracion();
                },
                error: (error) => {
                    console.error('Error eliminando configuración anterior:', error);
                    this.loading = false;
                    this.cdr.detectChanges();
                    Swal.fire('Error', 'No se pudo actualizar la configuración', 'error');
                }
            });
        } else {
            this.crearNuevaConfiguracion();
        }
    }

    private crearNuevaConfiguracion() {
        this.usuarioConfigService.create({
            id_usuario: this.userId,
            id_configuracion_sistema: Number(this.configuracionSeleccionada!)
        }).subscribe({
            next: () => {
                this.loading = false;
                this.cdr.detectChanges();
                Swal.fire('Éxito', 'Configuración actualizada correctamente', 'success');
                // Actualizar configuración actual
                this.configuracionActual = this.configuraciones.find(
                    c => c.id_configuracion_sistema === this.configuracionSeleccionada
                ) || null;
            },
            error: (error) => {
                console.error('Error guardando configuración:', error);
                this.loading = false;
                this.cdr.detectChanges();
                Swal.fire('Error', 'No se pudo guardar la configuración', 'error');
            }
        });
    }

    guardarTerminal() {
        if (!this.terminalSeleccionada) {
            Swal.fire('Atención', 'Debe seleccionar una terminal', 'warning');
            return;
        }

        this.loading = true;
        this.cdr.detectChanges();

        // Usar el endpoint de asignación que elimina las anteriores
        this.usuarioTerminalService.assignTerminalesToUsuario({
            id_usuario: this.userId,
            id_terminales: [this.terminalSeleccionada]
        }).subscribe({
            next: () => {
                this.loading = false;
                // Actualizar terminal actual
                this.terminalActual = this.terminales.find(
                    t => t.id_terminal === this.terminalSeleccionada
                ) || null;
                this.cdr.detectChanges();
                Swal.fire('Éxito', 'Terminal asignada correctamente', 'success');
            },
            error: (error) => {
                console.error('Error asignando terminal:', error);
                this.loading = false;
                this.cdr.detectChanges();
                Swal.fire('Error', 'No se pudo asignar la terminal', 'error');
            }
        });
    }

    onLogout() {
        Swal.fire({
            title: '¿Cerrar sesión?',
            text: '¿Estás seguro que deseas cerrar sesión?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#003366',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.authService.logout();
                Swal.fire({
                    icon: 'success',
                    title: 'Sesión cerrada',
                    text: 'Has cerrado sesión exitosamente',
                    confirmButtonColor: '#003366',
                    timer: 2000
                });
                this.router.navigate(['/login']);
            }
        });
    }
}
