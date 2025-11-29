import { Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { Dashboard } from './components/main/dashboard/dashboard';
import { Main } from './components/main/main.component';
import { authGuard } from './guards/auth.guard';
import { Programas } from './components/main/sistemas/administracion/programas/programas';
import { Roles } from './components/main/sistemas/administracion/roles/roles';
import { Usuarios } from './components/main/sistemas/administracion/usuarios/usuarios';
import { Monedas } from './components/main/sistemas/administracion/monedas/monedas';
import { Modulos } from './components/main/sistemas/administracion/modulos/modulos';
import { CategoriasPrograma } from './components/main/sistemas/administracion/categorias-programa/categorias-programa';
import { Empresas } from './components/main/sistemas/administracion/empresas/empresas';
import { Sucursales } from './components/main/sistemas/administracion/sucursales/sucursales';
import { Depositos } from './components/main/sistemas/administracion/depositos/depositos';
import { PermisosRolProgramaComponent } from './components/main/sistemas/administracion/permisos-rol-programa/permisos-rol-programa';
import { ImpuestoComponent } from './components/main/sistemas/administracion/impuesto/impuesto.component';
import { CotizacionComponent } from './components/main/finanzas/mantenimientos/cotizacion/cotizacion.component';
import { MarcaComponent } from './components/main/inventarios/mantenimientos/marca/marca.component';
import { LineaComponent } from './components/main/inventarios/mantenimientos/linea/linea.component';
import { TipoArticuloComponent } from './components/main/inventarios/mantenimientos/tipo_articulo/tipo_articulo.component';
import { UnidadMedidaComponent } from './components/main/inventarios/mantenimientos/unidad-medida/unidad-medida.component';
import { ArticuloComponent } from './components/main/inventarios/mantenimientos/articulo/articulo.component';
import { PaisComponent } from './components/main/finanzas/mantenimientos/pais/pais.component';
import { DepartamentoComponent } from './components/main/finanzas/mantenimientos/departamento/departamento.component';
import { CiudadComponent } from './components/main/finanzas/mantenimientos/ciudad/ciudad.component';
import { ClienteComponent } from './components/main/finanzas/mantenimientos/cliente/cliente.component';
import { ProveedorComponent } from './components/main/finanzas/mantenimientos/proveedor/proveedor.component';
import { MotivoAjusteInventarioComponent } from './components/main/inventarios/mantenimientos/motivo-ajuste-inventario/motivo-ajuste-inventario.component';


export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    {
        path: 'app',
        component: Main,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: Dashboard },
            { path: 'sistemas/administracion/programas', component: Programas },
            { path: 'sistemas/administracion/roles', component: Roles },
            { path: 'sistemas/administracion/usuarios', component: Usuarios },
            { path: 'sistemas/administracion/monedas', component: Monedas },
            { path: 'sistemas/administracion/modulos', component: Modulos },
            { path: 'sistemas/administracion/categorias-programa', component: CategoriasPrograma },
            { path: 'sistemas/administracion/empresas', component: Empresas },
            { path: 'sistemas/administracion/sucursales', component: Sucursales },
            { path: 'sistemas/administracion/depositos', component: Depositos },
            { path: 'sistemas/administracion/permisos-rol-programa', component: PermisosRolProgramaComponent },
            { path: 'sistemas/administracion/impuestos', component: ImpuestoComponent },
            { path: 'finanzas/mantenimientos/cotizaciones', component: CotizacionComponent },
            { path: 'inventarios/mantenimientos/marcas', component: MarcaComponent },
            { path: 'inventarios/mantenimientos/lineas', component: LineaComponent },
            { path: 'inventarios/mantenimientos/tipos-articulos', component: TipoArticuloComponent },
            { path: 'inventarios/mantenimientos/unidades-medidas', component: UnidadMedidaComponent },
            { path: 'inventarios/mantenimientos/articulos', component: ArticuloComponent },
            { path: 'finanzas/mantenimientos/paises', component: PaisComponent },
            { path: 'finanzas/mantenimientos/departamentos', component: DepartamentoComponent },
            { path: 'finanzas/mantenimientos/ciudades', component: CiudadComponent },
            { path: 'finanzas/mantenimientos/clientes', component: ClienteComponent },
            { path: 'finanzas/mantenimientos/proveedores', component: ProveedorComponent },
            { path: 'inventarios/mantenimientos/motivos-ajustes', component: MotivoAjusteInventarioComponent },
        ],

    },
    { path: '**', redirectTo: 'login' }
];
