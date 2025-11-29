import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { PermissionService } from '../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private router: Router
  ) { }

  onLogin() {
    if (!this.username || !this.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos vacíos',
        text: 'Por favor ingrese usuario y contraseña',
        confirmButtonColor: '#003366'
      });
      return;
    }

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        // Guardar ambos tokens
        this.authService.saveToken(response.access_token);
        this.authService.saveRefreshToken(response.refresh_token);
        // Guardar datos del usuario
        this.authService.saveUserData(response.usuario);

        // Cargar permisos del usuario
        this.permissionService.loadPermissions().then(() => {
          // Mostrar mensaje de éxito
          Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            text: `Hola ${response.usuario.nombre}`,
            confirmButtonColor: '#003366',
            timer: 2000
          });

          // Navegar al dashboard
          this.router.navigate(['/app/dashboard']);
        }).catch(err => {
          console.error('Error al cargar permisos:', err);
          // Aún así navegar al dashboard
          this.router.navigate(['/app/dashboard']);
        });
      },
      error: (error) => {
        console.error('Error en login:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.message || 'Credenciales incorrectas',
          confirmButtonColor: '#003366'
        });
      }
    });
  }
}
