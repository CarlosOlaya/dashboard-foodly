import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { PlatformService } from '../../services/platform.service';
import { Factura, FacturaFiltros } from '../../../shared/interfaces';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion.component.html',
  styleUrls: ['./facturacion.component.css']
})
export class FacturacionComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['numero_factura', 'mesa', 'mesero', 'total', 'metodo_pago', 'estado', 'fecha_apertura', 'acciones'];
  dataSource = new MatTableDataSource<Factura>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // ── Filtros ──
  periodoActual: 'hoy' | 'semana' | 'mes' | 'personalizado' = 'hoy';
  filtroEstado = '';
  fechaDesde = '';
  fechaHasta = '';
  searchText = '';
  loading = true;

  // ── Métricas ──
  totalVentas = 0;
  totalFacturas = 0;
  ticketPromedio = 0;
  totalAnuladas = 0;
  totalPropinas = 0;
  totalDescuentos = 0;
  metodosPago: { metodo: string; total: number; cantidad: number }[] = [];

  constructor(
    private platformService: PlatformService,
    private pdfService: PdfService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.setPeriodo('hoy');
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // ══════════════════════════════════════════════
  // Filtros de periodo
  // ══════════════════════════════════════════════
  setPeriodo(periodo: 'hoy' | 'semana' | 'mes' | 'personalizado'): void {
    this.periodoActual = periodo;
    const hoy = new Date();

    if (periodo === 'hoy') {
      this.fechaDesde = this.formatDate(hoy);
      this.fechaHasta = this.formatDate(hoy);
    } else if (periodo === 'semana') {
      const lunes = new Date(hoy);
      lunes.setDate(hoy.getDate() - hoy.getDay() + (hoy.getDay() === 0 ? -6 : 1));
      this.fechaDesde = this.formatDate(lunes);
      this.fechaHasta = this.formatDate(hoy);
    } else if (periodo === 'mes') {
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      this.fechaDesde = this.formatDate(inicio);
      this.fechaHasta = this.formatDate(hoy);
    }

    if (periodo !== 'personalizado') {
      this.cargarFacturas();
    }
  }

  aplicarFechasPersonalizadas(): void {
    if (this.fechaDesde && this.fechaHasta) {
      this.periodoActual = 'personalizado';
      this.cargarFacturas();
    }
  }

  setFiltroEstado(estado: string): void {
    this.filtroEstado = estado;
    this.cargarFacturas();
  }

  cargarFacturas(): void {
    this.loading = true;
    const filtros: FacturaFiltros = {};
    if (this.filtroEstado) filtros.estado = this.filtroEstado;
    if (this.fechaDesde) filtros.desde = this.fechaDesde;
    if (this.fechaHasta) filtros.hasta = this.fechaHasta;

    this.platformService.getFacturas({ ...filtros, limit: 100 }).subscribe({
      next: resp => {
        this.dataSource.data = resp.data;
        this.calcularMetricas(resp.data);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // ══════════════════════════════════════════════
  // Métricas
  // ══════════════════════════════════════════════
  private calcularMetricas(facturas: Factura[]): void {
    const cerradas = facturas.filter(f => f.estado === 'cerrada');
    this.totalAnuladas = facturas.filter(f => f.estado === 'anulada').length;
    this.totalFacturas = cerradas.length;
    this.totalVentas = cerradas.reduce((sum, f) => sum + (Number(f.total) || 0), 0);
    this.totalPropinas = cerradas.reduce((sum, f) => sum + (Number(f.propina) || 0), 0);
    this.totalDescuentos = cerradas.reduce((sum, f) => sum + (Number(f.descuento_monto) || 0), 0);
    this.ticketPromedio = this.totalFacturas > 0 ? this.totalVentas / this.totalFacturas : 0;

    // Agrupar por método de pago
    const map = new Map<string, { total: number; cantidad: number }>();
    for (const f of cerradas) {
      const metodo = f.metodo_pago || 'efectivo';
      const entry = map.get(metodo) || { total: 0, cantidad: 0 };
      entry.total += Number(f.total) || 0;
      entry.cantidad++;
      map.set(metodo, entry);
    }
    this.metodosPago = Array.from(map.entries())
      .map(([metodo, data]) => ({ metodo, ...data }))
      .sort((a, b) => b.total - a.total);
  }

  // ══════════════════════════════════════════════
  // Búsqueda
  // ══════════════════════════════════════════════
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // ══════════════════════════════════════════════
  // Acciones
  // ══════════════════════════════════════════════
  facturaSel(row: Factura): void {
    this.router.navigateByUrl('/home/factura/' + row.id);
  }

  imprimirFactura(facturaId: string, event: Event): void {
    event.stopPropagation();
    this.pdfService.imprimirFactura(facturaId)
      .catch(err => console.error('Error al imprimir factura:', err));
  }

  // ══════════════════════════════════════════════
  // Exportar CSV
  // ══════════════════════════════════════════════
  exportarCSV(): void {
    const facturas = this.dataSource.filteredData;
    if (!facturas.length) return;

    const headers = ['# Factura', 'Mesa', 'Mesero', 'Estado', 'Subtotal', 'IVA', 'Servicio', 'Total', 'Método Pago', 'Fecha'];
    const rows = facturas.map(f => [
      f.numero_factura || '-',
      f.mesa?.numero || '-',
      f.empleado ? `${f.empleado.nombre} ${f.empleado.apellido1 || ''}` : '-',
      f.estado,
      f.subtotal,
      f.monto_iva || 0,
      f.monto_servicio || 0,
      f.total,
      f.metodo_pago || '-',
      f.fecha_apertura ? new Date(f.fecha_apertura).toLocaleString('es-CO') : '-',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facturas_${this.fechaDesde}_${this.fechaHasta}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ══════════════════════════════════════════════
  // Helpers
  // ══════════════════════════════════════════════
  getMetodoLabel(metodo: string): string {
    const labels: Record<string, string> = {
      efectivo: 'Efectivo',
      datafono: 'Datáfono',
      tarjeta: 'Tarjeta',
      transferencia: 'Transferencia',
      mixto: 'Mixto',
      credito: 'Crédito',
    };
    return labels[metodo?.toLowerCase()] || metodo || 'Efectivo';
  }

  getMetodoIcon(metodo: string): string {
    const icons: Record<string, string> = {
      efectivo: 'payments',
      datafono: 'credit_card',
      tarjeta: 'credit_card',
      transferencia: 'account_balance',
      mixto: 'swap_horiz',
      credito: 'schedule',
    };
    return icons[metodo?.toLowerCase()] || 'payments';
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
