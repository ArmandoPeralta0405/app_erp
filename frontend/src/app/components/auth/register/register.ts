import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Usuario } from '../../../models/usuario.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  usuario: Usuario = {
    id_usuario: 0,
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    direccion: '',
    alias: '',
    clave: '',
    estado: true
  };

  constructor(private router: Router) { }

  onRegister() {
    console.log('Datos de registro:', this.usuario);
    // Aquí iría la llamada al servicio
    Swal.fire({
      icon: 'success',
      title: 'Registro Exitoso',
      text: 'Usuario registrado correctamente (simulado)',
      confirmButtonColor: '#003366'
    }).then(() => {
      this.router.navigate(['/login']);
    });
  }
}
