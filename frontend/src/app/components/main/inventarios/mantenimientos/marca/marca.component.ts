import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarcaService, Marca, CreateMarcaDto, UpdateMarcaDto } from '../../../../../services/marca.service';
import { PermissionService } from '../../../../../services/permission.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-marca',
  imports: [CommonModule, FormsModule],
  templateUrl: './marca.component.html',
  styleUrl: './marca.component.css',
})
export class MarcaComponent implements OnInit {
  marcas: Marca[] = [];
  marcasFiltrados: Marca[] = [];
  marcasPaginados: Marca[] = [];
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
  currentMarcaId: number | null = null;

  formData: CreateMarcaDto = {
    nombre: ''
  };

  // Permisos
  canWrite = false;
  canDelete = false;

  constructor(
    private marcaService: MarcaService,
    private permissionService: PermissionService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Cargar permisos para esta ruta
    this.canWrite = this.permissionService.canWrite('/inventarios/mantenimientos/marcas');
    this.canDelete = this.permissionService.canDelete('/inventarios/mantenimientos/marcas');

    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;

    this.marcaService.getAll().subscribe({
      next: (marcas) => {
        this.marcas = marcas || [];
        this.aplicarFiltros();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error cargando marcas:', error);
        this.loading = false;
        this.cdr.detectChanges();
        Swal.fire('Error', 'Error al cargar las marcas', 'error');
      }
    });
  }

  aplicarFiltros() {
    // Filtrar por búsqueda
    if (this.searchTerm.trim() === '') {
      this.marcasFiltrados = [...this.marcas];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.marcasFiltrados = this.marcas.filter(r =>
        r.nombre.toLowerCase().includes(term)
      );
    }

    // Calcular paginación
    this.totalPages = Math.ceil(this.marcasFiltrados.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }

    // Calcular páginas
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

    // Calcular marcas paginados
    this.calcularPaginacion();
  }

  calcularPaginacion() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.marcasPaginados = this.marcasFiltrados.slice(start, end);
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
    this.currentMarcaId = null;
    this.formData = {
      nombre: ''
    };
    this.showForm = true;
  }

  abrirFormularioEditar(Marca: Marca) {
    this.isEditing = true;
    this.currentMarcaId = Marca.id_marca;
    this.formData = {
      nombre: Marca.nombre
    };
    this.showForm = true;
  }

  cerrarFormulario() {
    this.showForm = false;
    this.isEditing = false;
    this.currentMarcaId = null;
  }

  guardarMarca() {
    // Validaciones
    if (!this.formData.nombre || this.formData.nombre.trim() === '') {
      Swal.fire('Error', 'El nombre de la Marca es requerido', 'warning');
      return;
    }

    if (this.formData.nombre.length > 150) {
      Swal.fire('Error', 'El nombre no puede exceder 150 caracteres', 'warning');
      return;
    }

    if (this.isEditing && this.currentMarcaId) {
      // Actualizar
      this.marcaService.update(this.currentMarcaId, this.formData).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Marca actualizada correctamente', 'success');
          this.cerrarFormulario();
          this.cargarDatos();
        },
        error: (error: any) => {
          console.error('Error actualizando Marca:', error);
          Swal.fire('Error', error.error?.message || 'Error al actualizar la Marca', 'error');
        }
      });
    } else {
      // Crear
      this.marcaService.create(this.formData).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Marca creada correctamente', 'success');
          this.cerrarFormulario();
          this.cargarDatos();
        },
        error: (error: any) => {
          console.error('Error creando Marca:', error);
          Swal.fire('Error', error.error?.message || 'Error al crear la Marca', 'error');
        }
      });
    }
  }

  eliminarMarca(Marca: Marca) {
    Swal.fire({
      title: '¿Eliminar Marca?',
      text: `¿Estás seguro de eliminar "${Marca.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.marcaService.delete(Marca.id_marca).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Marca eliminada correctamente', 'success');
            this.cargarDatos();
          },
          error: (error: any) => {
            console.error('Error eliminando Marca:', error);
            Swal.fire('Error', 'Error al eliminar la Marca', 'error');
          }
        });
      }
    });
  }
}
