
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EmpresaModule } from './empresa/empresa.module';
import { SucursalModule } from './sucursal/sucursal.module';
import { MonedaModule } from './moneda/moneda.module';
import { DepositoModule } from './deposito/deposito.module';
import { RolModule } from './rol/rol.module';
import { ModuloModule } from './modulo/modulo.module';
import { CategoriaProgramaModule } from './categoria_programa/categoria_programa.module';
import { ProgramaModule } from './programa/programa.module';
import { RolProgramaModule } from './rol_programa/rol_programa.module';
import { UsuarioModule } from './usuario/usuario.module';
import { UsuarioRolModule } from './usuario_rol/usuario_rol.module';
import { AuthModule } from './auth/auth.module';
import { ImpuestoModule } from './impuesto/impuesto.module';
import { CotizacionModule } from './cotizacion/cotizacion.module';
import { MarcaModule } from './marca/marca.module';
import { LineaModule } from './linea/linea.module';
import { ClaseDocumentoModule } from './clase_documento/clase_documento.module';
import { Tipo_articuloModule } from './tipo_articulo/tipo_articulo.module';
import { UnidadMedidaModule } from './unidad_medida/unidad_medida.module';
import { ArticuloModule } from './articulo/articulo.module';
import { ArticuloCodigoBarraModule } from './articulo_codigo_barra/articulo_codigo_barra.module';
import { PaisModule } from './pais/pais.module';
import { DepartamentoModule } from './departamento/departamento.module';
import { CiudadModule } from './ciudad/ciudad.module';
import { ClienteModule } from './cliente/cliente.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { MotivoAjusteInventarioModule } from './motivo-ajuste-inventario/motivo-ajuste-inventario.module';
import { TipoTransaccionModule } from './tipo_transaccion/tipo_transaccion.module';
import { ConfiguracionSistemaModule } from './configuracion_sistema/configuracion_sistema.module';
import { UsuarioConfiguracionSistemaModule } from './usuario_configuracion_sistema/usuario_configuracion_sistema.module';
import { TerminalModule } from './terminal/terminal.module';
import { UsuarioTerminalModule } from './usuario_terminal/usuario_terminal.module';
import { MovimientoStockModule } from './movimiento-stock/movimiento-stock.module';
import { AjusteInventarioModule } from './ajuste-inventario/ajuste-inventario.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ArticuloDepositoModule } from './articulo-deposito/articulo-deposito.module';
import { GrupoCuentaContableModule } from './grupo_cuenta_contable/grupo_cuenta_contable.module';
import { CuentaContableModule } from './cuenta_contable/cuenta_contable.module';
import { ConceptoModule } from './concepto/concepto.module';

@Module({
  imports: [
    PrismaModule,
    EmpresaModule,
    SucursalModule,
    MonedaModule,
    DepositoModule,
    RolModule,
    ModuloModule,
    CategoriaProgramaModule,
    ProgramaModule,
    RolProgramaModule,
    UsuarioModule,
    UsuarioRolModule,
    AuthModule,
    ImpuestoModule,
    CotizacionModule,
    MarcaModule,
    LineaModule,
    Tipo_articuloModule,
    UnidadMedidaModule,
    ArticuloModule,
    ArticuloCodigoBarraModule,
    PaisModule,
    DepartamentoModule,
    CiudadModule,
    ClienteModule,
    ProveedorModule,
    MotivoAjusteInventarioModule,
    TipoTransaccionModule,
    ClaseDocumentoModule,
    ConfiguracionSistemaModule,
    UsuarioConfiguracionSistemaModule,
    TerminalModule,
    UsuarioTerminalModule,
    MovimientoStockModule,
    AjusteInventarioModule,
    DashboardModule,
    ArticuloDepositoModule,
    GrupoCuentaContableModule,
    CuentaContableModule,
    ConceptoModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
