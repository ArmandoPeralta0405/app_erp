import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LineaService, Linea, CreateLineaDto } from '../../../../../services/linea.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-linea',
  imports: [CommonModule, FormsModule],
  templateUrl: './linea.component.html',
  styleUrl: './linea.component.css',
})
export class LineaComponent implements OnInit {
  lineas: Linea[] = [];
  lineasFiltrados: Linea[] = [];
  lineasPaginados: Linea[] = [];
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
  currentLineaId: number | null = null;

  formData: CreateLineaDto = {
    nombre: ''
  };

  // Permisos
  canWrite = false;
  canDelete = false;

  constructor(
    private LineaService: LineaService,
    private permissionService: PermissionService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Cargar permisos para esta ruta
    const currentRoute = '/inventarios/mantenimientos/lineas';
    this.canWrite = this.permissionService.canWrite(currentRoute);
    this.canDelete = this.permissionService.canDelete(currentRoute);

    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;

    this.LineaService.getAll().subscribe({
      next: (lineas) => {
        this.lineas = lineas || [];
        this.aplicarFiltros();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error cargando lineas:', error);
        this.loading = false;
        this.cdr.detectChanges();
        Swal.fire('Error', 'Error al cargar las lineas', 'error');
      }
    });
  }

  aplicarFiltros() {
    // Filtrar por búsqueda
    if (this.searchTerm.trim() === '') {
      this.lineasFiltrados = [...this.lineas];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.lineasFiltrados = this.lineas.filter(r =>
        r.nombre.toLowerCase().includes(term)
      );
    }

    // Calcular paginación
    this.totalPages = Math.ceil(this.lineasFiltrados.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }

    // Calcular páginas
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

    // Calcular lineas paginados
    this.calcularPaginacion();
  }

  calcularPaginacion() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.lineasPaginados = this.lineasFiltrados.slice(start, end);
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
    this.currentLineaId = null;
    this.formData = {
      nombre: ''
    };
    this.showForm = true;
  }

  abrirFormularioEditar(linea: Linea) {
    this.isEditing = true;
    this.currentLineaId = linea.id_linea;
    this.formData = {
      nombre: linea.nombre
    };
    this.showForm = true;
  }

  cerrarFormulario() {
    this.showForm = false;
    this.isEditing = false;
    this.currentLineaId = null;
  }

  guardarLinea() {
    // Validaciones
    if (!this.formData.nombre || this.formData.nombre.trim() === '') {
      Swal.fire('Error', 'El nombre de la Linea es requerida', 'warning');
      return;
    }

    if (this.formData.nombre.length > 150) {
      Swal.fire('Error', 'El nombre no puede exceder 150 caracteres', 'warning');
      return;
    }

    if (this.isEditing && this.currentLineaId) {
      // Actualizar
      this.LineaService.update(this.currentLineaId, this.formData).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Linea actualizada correctamente', 'success');
          this.cerrarFormulario();
          this.cargarDatos();
        },
        error: (error: any) => {
          console.error('Error actualizando Linea:', error);
          Swal.fire('Error', error.error?.message || 'Error al actualizar la Linea', 'error');
        }
      });
    } else {
      // Crear
      this.LineaService.create(this.formData).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Linea creada correctamente', 'success');
          this.cerrarFormulario();
          this.cargarDatos();
        },
        error: (error: any) => {
          console.error('Error creando Linea:', error);
          Swal.fire('Error', error.error?.message || 'Error al crear la Linea', 'error');
        }
      });
    }
  }

  eliminarLinea(linea: Linea) {
    Swal.fire({
      title: '¿Eliminar Linea?',
      text: `¿Estás seguro de eliminar "${linea.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.LineaService.delete(linea.id_linea).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Linea eliminada correctamente', 'success');
            this.cargarDatos();
          },
          error: (error: any) => {
            console.error('Error eliminando Linea:', error);
            Swal.fire('Error', 'Error al eliminar la Linea', 'error');
          }
        });
      }
    });
  }
}
