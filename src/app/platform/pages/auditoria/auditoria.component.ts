import { Component, OnInit } from '@angular/core';
import { PlatformService } from '../../services/platform.service';

@Component({
  selector: 'app-auditoria',
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.css'],
})
export class AuditoriaComponent implements OnInit {

  activeTab: 'log' | 'consecutivos' | 'nc' | 'correcciones' = 'log';

  // ── Filtros ──
  filtroDesde = '';
  filtroHasta = '';
  filtroAccion = '';

  // ── Data ──
  auditLog: any[] = [];
  auditTotal = 0;
  auditOffset = 0;
  auditLimit = 30;

  consecutivosResult: any = null;
  notasCredito: any[] = [];
  correcciones: any[] = [];
  resumen: any = null;

  loading = false;

  accionesDisponibles = [
    { value: '', label: 'Todas las acciones' },
    { value: 'factura:cerrar', label: 'Factura cerrada' },
    { value: 'factura:anular', label: 'Factura anulada' },
    { value: 'nota_credito:emitir', label: 'Nota Crédito emitida' },
  ];

  constructor(private platformService: PlatformService) { }

  ngOnInit(): void {
    this.setFiltrosFechaHoy();
    this.cargarLog();
    this.cargarResumen();
  }

  setFiltrosFechaHoy(): void {
    const hoy = new Date();
    const hace30 = new Date(hoy);
    hace30.setDate(hace30.getDate() - 30);
    this.filtroDesde = hace30.toISOString().substring(0, 10);
    this.filtroHasta = hoy.toISOString().substring(0, 10);
  }

  onTabChange(tab: 'log' | 'consecutivos' | 'nc' | 'correcciones'): void {
    this.activeTab = tab;
    if (tab === 'log') this.cargarLog();
    if (tab === 'consecutivos') this.validarConsecutivos();
    if (tab === 'nc') this.cargarNC();
    if (tab === 'correcciones') this.cargarCorrecciones();
  }

  // ── LOG ──
  cargarLog(): void {
    this.loading = true;
    const filtros: Record<string, string> = {
      limit: String(this.auditLimit),
      offset: String(this.auditOffset),
    };
    if (this.filtroDesde) filtros['desde'] = this.filtroDesde;
    if (this.filtroHasta) filtros['hasta'] = this.filtroHasta + 'T23:59:59';
    if (this.filtroAccion) filtros['accion'] = this.filtroAccion;

    this.platformService.getAuditLog(filtros).subscribe({
      next: (resp) => {
        this.auditLog = resp.items || [];
        this.auditTotal = resp.total || 0;
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  paginaAnterior(): void {
    if (this.auditOffset <= 0) return;
    this.auditOffset = Math.max(0, this.auditOffset - this.auditLimit);
    this.cargarLog();
  }

  paginaSiguiente(): void {
    if (this.auditOffset + this.auditLimit >= this.auditTotal) return;
    this.auditOffset += this.auditLimit;
    this.cargarLog();
  }

  get paginaActual(): number {
    return Math.floor(this.auditOffset / this.auditLimit) + 1;
  }

  get totalPaginas(): number {
    return Math.ceil(this.auditTotal / this.auditLimit);
  }

  aplicarFiltros(): void {
    this.auditOffset = 0;
    this.cargarLog();
    this.cargarResumen();
  }

  // ── RESUMEN ──
  cargarResumen(): void {
    this.platformService.getAuditResumen(this.filtroDesde, this.filtroHasta ? this.filtroHasta + 'T23:59:59' : undefined)
      .subscribe(r => this.resumen = r);
  }

  // ── CONSECUTIVOS ──
  validarConsecutivos(): void {
    this.loading = true;
    this.platformService.validarConsecutivos().subscribe({
      next: (r) => { this.consecutivosResult = r; this.loading = false; },
      error: () => this.loading = false,
    });
  }

  // ── NOTAS CRÉDITO ──
  cargarNC(): void {
    this.loading = true;
    this.platformService.getAuditNC(this.filtroDesde, this.filtroHasta ? this.filtroHasta + 'T23:59:59' : undefined)
      .subscribe({
        next: (r) => { this.notasCredito = r || []; this.loading = false; },
        error: () => this.loading = false,
      });
  }

  // ── CORRECCIONES ──
  cargarCorrecciones(): void {
    this.loading = true;
    this.platformService.getAuditCorrecciones(this.filtroDesde, this.filtroHasta ? this.filtroHasta + 'T23:59:59' : undefined)
      .subscribe({
        next: (r) => { this.correcciones = r || []; this.loading = false; },
        error: () => this.loading = false,
      });
  }

  // ── Helpers ──
  formatMoney(val: any): string {
    return (Number(val) || 0).toLocaleString('es-CO');
  }

  getAccionLabel(accion: string): string {
    const map: Record<string, string> = {
      'factura:cerrar': 'Cierre',
      'factura:anular': 'Anulación',
      'nota_credito:emitir': 'Nota Crédito',
      'factura:corregir': 'Corrección',
    };
    return map[accion] || accion;
  }

  getAccionIcon(accion: string): string {
    const map: Record<string, string> = {
      'factura:cerrar': 'check_circle',
      'factura:anular': 'cancel',
      'nota_credito:emitir': 'receipt_long',
      'factura:corregir': 'edit_note',
    };
    return map[accion] || 'info';
  }

  getAccionColor(accion: string): string {
    const map: Record<string, string> = {
      'factura:cerrar': 'var(--success)',
      'factura:anular': 'var(--danger)',
      'nota_credito:emitir': 'var(--warning)',
      'factura:corregir': 'var(--info)',
    };
    return map[accion] || 'var(--text-secondary)';
  }
}
