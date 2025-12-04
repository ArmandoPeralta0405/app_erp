import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-header',
    imports: [CommonModule],
    templateUrl: './header.html',
    styleUrl: './header.css',
})
export class Header implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>();

    // Datos del usuario
    userName: string = 'Usuario';
    userAlias: string = '';

    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.loadUserData();
    }

    loadUserData() {
        const user = this.authService.getCurrentUser();
        if (user) {
            // Construir nombre completo, manejando apellido opcional
            const apellido = user.apellido ? ` ${user.apellido}` : '';
            this.userName = `${user.nombre}${apellido}`;
            this.userAlias = user.alias;
        }
    }

    onToggleSidebar() {
        this.toggleSidebar.emit();
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
                // Limpiar tokens
                this.authService.logout();

                // Mostrar mensaje de confirmación
                Swal.fire({
                    icon: 'success',
                    title: 'Sesión cerrada',
                    text: 'Has cerrado sesión exitosamente',
                    confirmButtonColor: '#003366',
                    timer: 2000
                });

                // Redirigir a login
                this.router.navigate(['/login']);
            }
        });
    }
}
