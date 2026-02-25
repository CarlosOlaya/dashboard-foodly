import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse, Categoria, CerrarTurnoResponse, Cliente, Comanda, ComandaItemRequest,
  DetalleAccionResponse, Empleado, EnviarComandaResponse,
  Factura, FacturaActivaMesa, FacturaFiltros, Mesa, MovimientoInventario, MovimientoRequest,
  PaginatedResponse, Plato, Producto,
  Proveedor, RecetaInsumo, ResumenInventario, Tenant, TomaInventarioResponse, TurnoCaja,
  VentaDiaria, DashboardResponse, PrecuentaResponse, ResumenTurnoEnVivo
} from '../../shared/interfaces';

// Importar los servicios individuales
import { EmpleadosService } from './empleados.service';
import { ClientesService } from './clientes.service';
import { MesasService } from './mesas.service';
import { CartaService } from './carta.service';
import { FacturasApiService } from './facturas-api.service';
import { ComandasApiService } from './comandas-api.service';
import { TurnosService } from './turnos.service';
import { ProveedoresApiService } from './proveedores-api.service';
import { InventarioApiService } from './inventario-api.service';
import { EmpresaService } from './empresa.service';

/**
 * PlatformService — FACADE
 *
 * Este servicio ahora actúa como fachada que delega a servicios de dominio.
 * Se mantiene para backwards-compatibility; los componentes nuevos deben
 * inyectar el servicio de dominio directamente.
 *
 * @deprecated Inyectar el servicio de dominio específico en lugar de PlatformService.
 */
@Injectable({ providedIn: 'root' })
export class PlatformService {

  constructor(
    private empleadosSvc: EmpleadosService,
    private clientesSvc: ClientesService,
    private mesasSvc: MesasService,
    private cartaSvc: CartaService,
    private facturasSvc: FacturasApiService,
    private comandasSvc: ComandasApiService,
    private turnosSvc: TurnosService,
    private proveedoresSvc: ProveedoresApiService,
    private inventarioSvc: InventarioApiService,
    private empresaSvc: EmpresaService,
  ) { }

  // ── EMPLEADOS ──────────────────────────────────────────
  getEmpleados(): Observable<Empleado[]> { return this.empleadosSvc.getEmpleados(); }
  getEmpleado(id: string): Observable<Empleado> { return this.empleadosSvc.getEmpleado(id); }
  crearEmpleado(data: Partial<Empleado>): Observable<Empleado> { return this.empleadosSvc.crearEmpleado(data); }
  actualizarEmpleado(id: string, data: Partial<Empleado>): Observable<Empleado> { return this.empleadosSvc.actualizarEmpleado(id, data); }
  eliminarEmpleado(id: string): Observable<ApiResponse> { return this.empleadosSvc.eliminarEmpleado(id); }

  // ── CLIENTES ──────────────────────────────────────────
  getClientes(): Observable<Cliente[]> { return this.clientesSvc.getClientes(); }
  getCliente(id: string): Observable<Cliente> { return this.clientesSvc.getCliente(id); }
  crearCliente(data: Partial<Cliente>): Observable<ApiResponse<Cliente>> { return this.clientesSvc.crearCliente(data); }
  actualizarCliente(id: string, data: Partial<Cliente>): Observable<Cliente> { return this.clientesSvc.actualizarCliente(id, data); }
  eliminarCliente(id: string): Observable<ApiResponse> { return this.clientesSvc.eliminarCliente(id); }

  // ── MESAS ──────────────────────────────────────────────
  getMesas(): Observable<Mesa[]> { return this.mesasSvc.getMesas(); }
  abrirMesa(mesaId: string, empleadoId: string, comensales = 1): Observable<ApiResponse> { return this.mesasSvc.abrirMesa(mesaId, empleadoId, comensales); }
  actualizarEstadoMesa(mesaId: string, estado: string, empleadoId?: string): Observable<ApiResponse> { return this.mesasSvc.actualizarEstadoMesa(mesaId, estado, empleadoId); }
  actualizarComensales(mesaId: string, comensales: number): Observable<ApiResponse> { return this.mesasSvc.actualizarComensales(mesaId, comensales); }
  liberarMesa(mesaId: string): Observable<ApiResponse> { return this.mesasSvc.liberarMesa(mesaId); }
  getFacturaActivaMesa(mesaId: string): Observable<FacturaActivaMesa> { return this.mesasSvc.getFacturaActivaMesa(mesaId); }

  // ── FACTURAS / ITEMS ──────────────────────────────────
  enviarComanda(facturaId: string, items: ComandaItemRequest[]): Observable<EnviarComandaResponse> { return this.comandasSvc.enviarComanda(facturaId, items); }
  anularDetalle(detalleId: string, motivo: string): Observable<DetalleAccionResponse> { return this.facturasSvc.anularDetalle(detalleId, motivo); }
  ajustarCantidadDetalle(detalleId: string, nuevaCantidad: number, motivo: string): Observable<DetalleAccionResponse> { return this.facturasSvc.ajustarCantidadDetalle(detalleId, nuevaCantidad, motivo); }
  transferirItems(detalleIds: string[], mesaDestinoId: string, motivo?: string): Observable<ApiResponse> { return this.facturasSvc.transferirItems(detalleIds, mesaDestinoId, motivo); }

  // ── CARTA / PLATOS ────────────────────────────────────
  getCategorias(): Observable<Categoria[]> { return this.cartaSvc.getCategorias(); }
  crearCategoria(nombre: string): Observable<ApiResponse<Categoria>> { return this.cartaSvc.crearCategoria(nombre); }
  actualizarCategoria(id: string, nombre: string): Observable<ApiResponse<Categoria>> { return this.cartaSvc.actualizarCategoria(id, nombre); }
  eliminarCategoria(id: string): Observable<ApiResponse> { return this.cartaSvc.eliminarCategoria(id); }
  getCarta(): Observable<Plato[]> { return this.cartaSvc.getCarta(); }
  getPlato(id: string): Observable<Plato> { return this.cartaSvc.getPlato(id); }
  crearPlato(data: Partial<Plato>): Observable<ApiResponse<Plato>> { return this.cartaSvc.crearPlato(data); }
  actualizarPlato(id: string, data: Partial<Plato>): Observable<ApiResponse> { return this.cartaSvc.actualizarPlato(id, data); }
  toggleDisponibilidad(id: string, disponibilidad: boolean): Observable<ApiResponse> { return this.cartaSvc.toggleDisponibilidad(id, disponibilidad); }
  eliminarPlato(id: string): Observable<ApiResponse> { return this.cartaSvc.eliminarPlato(id); }

  // ── RECETAS ─────────────────────────────────────────
  getReceta(platoId: string): Observable<RecetaInsumo[]> { return this.cartaSvc.getReceta(platoId); }
  setReceta(platoId: string, insumos: { producto_id: string; cantidad: number }[]): Observable<ApiResponse> { return this.cartaSvc.setReceta(platoId, insumos); }
  deleteRecetaInsumo(insumoId: string): Observable<ApiResponse> { return this.cartaSvc.deleteRecetaInsumo(insumoId); }

  // ── FACTURAS ──────────────────────────────────────────
  getFacturas(filtros?: FacturaFiltros): Observable<PaginatedResponse<Factura>> { return this.facturasSvc.getFacturas(filtros); }
  getFactura(id: string): Observable<Factura> { return this.facturasSvc.getFactura(id); }
  cerrarFactura(id: string, metodoPago: string, propina = 0, descuentoPct = 0): Observable<ApiResponse> { return this.facturasSvc.cerrarFactura(id, metodoPago, propina, descuentoPct); }
  cerrarFacturaDividida(id: string, pagos: Array<{ metodo: string; monto: number; propina?: number; ref?: string; pagado_por?: string }>, propina = 0, descuentoPct = 0): Observable<ApiResponse> { return this.facturasSvc.cerrarFacturaDividida(id, pagos, propina, descuentoPct); }
  reabrirFactura(id: string, mesaId: string): Observable<ApiResponse> { return this.facturasSvc.reabrirFactura(id, mesaId); }
  anularFactura(id: string, motivo: string): Observable<ApiResponse> { return this.facturasSvc.anularFactura(id, motivo); }
  descuentoItem(detalleId: string, tipo: 'porcentaje' | 'valor', valor: number): Observable<ApiResponse> { return this.facturasSvc.descuentoItem(detalleId, tipo, valor); }
  descuentoMesa(facturaId: string, tipo: 'porcentaje' | 'valor', valor: number): Observable<ApiResponse> { return this.facturasSvc.descuentoMesa(facturaId, tipo, valor); }
  getPrecuenta(facturaId: string, servicioPct = 0): Observable<PrecuentaResponse> { return this.facturasSvc.getPrecuenta(facturaId, servicioPct); }
  getVentasDiarias(): Observable<VentaDiaria[]> { return this.facturasSvc.getVentasDiarias(); }
  getDashboard(): Observable<DashboardResponse> { return this.facturasSvc.getDashboard(); }

  // ── COMANDAS ──────────────────────────────────────────
  generarComanda(facturaId: string, items: ComandaItemRequest[]): Observable<ApiResponse> { return this.comandasSvc.generarComanda(facturaId, items); }
  getComandasActivas(area?: string): Observable<Comanda[]> { return this.comandasSvc.getComandasActivas(area); }
  marcarComandaImpresa(id: string): Observable<ApiResponse> { return this.comandasSvc.marcarComandaImpresa(id); }
  marcarComandaLista(id: string): Observable<ApiResponse> { return this.comandasSvc.marcarComandaLista(id); }
  marcarComandaEntregada(id: string): Observable<ApiResponse> { return this.comandasSvc.marcarComandaEntregada(id); }
  getComandasHoy(): Observable<Comanda[]> { return this.comandasSvc.getComandasHoy(); }

  // ── TURNOS ────────────────────────────────────────────
  abrirTurno(efectivoInicial = 0): Observable<ApiResponse<TurnoCaja>> { return this.turnosSvc.abrirTurno(efectivoInicial); }
  cerrarTurno(turnoId: string, efectivoContado: number, observaciones?: string): Observable<CerrarTurnoResponse> { return this.turnosSvc.cerrarTurno(turnoId, efectivoContado, observaciones); }
  getTurnoActivo(): Observable<TurnoCaja | null> { return this.turnosSvc.getTurnoActivo(); }
  getHistorialTurnos(): Observable<TurnoCaja[]> { return this.turnosSvc.getHistorialTurnos(); }
  getTurno(id: string): Observable<TurnoCaja> { return this.turnosSvc.getTurno(id); }
  getResumenTurnoEnVivo(): Observable<ResumenTurnoEnVivo> { return this.turnosSvc.getResumenTurnoEnVivo(); }

  // ── PROVEEDORES ───────────────────────────────────────
  getProveedores(): Observable<Proveedor[]> { return this.proveedoresSvc.getProveedores(); }
  getProveedor(id: string): Observable<Proveedor> { return this.proveedoresSvc.getProveedor(id); }
  crearProveedor(data: Partial<Proveedor>): Observable<ApiResponse<Proveedor>> { return this.proveedoresSvc.crearProveedor(data); }
  actualizarProveedor(id: string, data: Partial<Proveedor>): Observable<Proveedor> { return this.proveedoresSvc.actualizarProveedor(id, data); }
  eliminarProveedor(id: string): Observable<ApiResponse> { return this.proveedoresSvc.eliminarProveedor(id); }

  // ── INVENTARIO ────────────────────────────────────────
  getProductos(): Observable<Producto[]> { return this.inventarioSvc.getProductos(); }
  getStockBajo(): Observable<Producto[]> { return this.inventarioSvc.getStockBajo(); }
  crearProducto(data: Partial<Producto>): Observable<ApiResponse<Producto>> { return this.inventarioSvc.crearProducto(data); }
  registrarMovimiento(data: MovimientoRequest): Observable<ApiResponse> { return this.inventarioSvc.registrarMovimiento(data); }
  getMovimientos(productoId?: string): Observable<MovimientoInventario[]> { return this.inventarioSvc.getMovimientos(productoId); }
  actualizarProducto(id: string, data: Partial<Producto>): Observable<ApiResponse<Producto>> { return this.inventarioSvc.actualizarProducto(id, data); }
  eliminarProducto(id: string): Observable<ApiResponse> { return this.inventarioSvc.eliminarProducto(id); }
  getResumenInventario(): Observable<ResumenInventario> { return this.inventarioSvc.getResumenInventario(); }
  registrarTomaInventario(items: { producto_id: string; conteo_fisico: number }[]): Observable<TomaInventarioResponse> { return this.inventarioSvc.registrarTomaInventario(items); }

  // ── EMPRESA / TENANT ─────────────────────────────────
  getEmpresa(): Observable<Tenant> { return this.empresaSvc.getEmpresa(); }
  actualizarEmpresa(data: Partial<Tenant>): Observable<Tenant> { return this.empresaSvc.actualizarEmpresa(data); }
  cambiarPlan(plan: string): Observable<ApiResponse> { return this.empresaSvc.cambiarPlan(plan); }

  // ── UPLOADS ─────────────────────────────────
  subirImagen(file: File, carpeta: 'platos' | 'logo' | 'general' = 'general'): Observable<{ ok: boolean; url: string; public_id: string }> { return this.empresaSvc.subirImagen(file, carpeta); }
}
