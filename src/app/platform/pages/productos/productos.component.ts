import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformService } from '../../services/platform.service';
import { PdfService } from '../../services/pdf.service';
import { Producto, MovimientoInventario, Categoria } from '../../../shared/interfaces';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  Number = Number;

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  stockBajo: Producto[] = [];
  categorias: Categoria[] = [];
  movimientos: MovimientoInventario[] = [];

  resumen = { total_productos: 0, stock_bajo: 0, agotados: 0, movimientos_hoy: 0 };

  loading = true;
  vista: 'productos' | 'movimientos' | 'stock-bajo' | 'toma' = 'productos';
  filtroTexto = '';
  productoSelId = '';
  showPrintMenu = false;
  tomaItems: { producto: Producto; conteo: number | null }[] = [];
  guardandoToma = false;

  constructor(
    private platformService: PlatformService,
    private pdfService: PdfService,
    private router: Router,
    private alert: AlertService,
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.platformService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.filtrar();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
    this.platformService.getStockBajo().subscribe(data => this.stockBajo = data);
    this.platformService.getCategorias().subscribe(cats => this.categorias = cats);
    this.platformService.getResumenInventario().subscribe(r => this.resumen = r);
  }

  filtrar(): void {
    const q = this.filtroTexto.toLowerCase().trim();
    this.productosFiltrados = !q
      ? this.productos
      : this.productos.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        (p.categoria?.nombre || '').toLowerCase().includes(q) ||
        (p.ubicacion_almacen || '').toLowerCase().includes(q)
      );
  }

  onSearch(event: Event): void {
    this.filtroTexto = (event.target as HTMLInputElement).value;
    this.filtrar();
  }

  cambiarVista(v: 'productos' | 'movimientos' | 'stock-bajo' | 'toma'): void {
    this.vista = v;
    if (v === 'movimientos' && !this.movimientos.length) {
      this.cargarMovimientos();
    }
    if (v === 'toma') {
      this.initToma();
    }
  }

  cargarMovimientos(productoId?: string): void {
    this.platformService.getMovimientos(productoId).subscribe(data => {
      this.movimientos = data;
      this.productoSelId = productoId || '';
    });
  }

  getStockClass(p: Producto): string {
    const stock = Number(p.stock);
    const min = Number(p.stock_minimo) || 0;
    if (stock <= 0) return 'stock-agotado';
    if (stock <= min) return 'stock-bajo';
    return 'stock-ok';
  }

  getStockLabel(p: Producto): string {
    const stock = Number(p.stock);
    const min = Number(p.stock_minimo) || 0;
    if (stock <= 0) return 'Agotado';
    if (stock <= min) return 'Bajo';
    return 'OK';
  }

  getTipoBadgeClass(tipo: string): string {
    if (tipo.includes('entrada') || tipo === 'devolucion') return 'mov-entrada';
    if (tipo.includes('salida')) return 'mov-salida';
    return 'mov-ajuste';
  }

  getTipoLabel(tipo: string): string {
    const map: Record<string, string> = {
      'entrada_compra': 'Compra',
      'entrada_ajuste': 'Ajuste +',
      'salida_venta': 'Venta',
      'salida_ajuste': 'Ajuste -',
      'devolucion': 'Devolución',
    };
    return map[tipo] || tipo;
  }

  // ── Crear producto ──
  nuevoProducto(): void {
    this.router.navigateByUrl('/home/agregar-producto');
  }

  // ── Editar producto ──
  editarProducto(p: Producto): void {
    this.router.navigate(['/home/editar-producto', p.id]);
  }

  // ── Eliminar producto ──
  async eliminarProducto(p: Producto): Promise<void> {
    const result = await this.alert.fire({
      icon: 'warning',
      title: `¿Eliminar "${p.nombre}"?`,
      text: 'Se desactivará del inventario. Los movimientos históricos se conservan.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    });

    if (!result.isConfirmed) return;

    this.platformService.eliminarProducto(p.id).subscribe({
      next: (resp) => {
        this.alert.success(resp.mensaje);
        this.cargarDatos();
      },
      error: (err) => this.alert.error(err?.error?.message || 'Error'),
    });
  }

  // ── Registrar movimiento manual ──
  async registrarMovimiento(producto: Producto): Promise<void> {
    const { value: formValues } = await this.alert.fire({
      title: producto.nombre,
      html: `
        <p style="font-size:13px; color:#888; margin-bottom:12px;">Stock actual: <strong>${Number(producto.stock)}</strong> ${producto.tipo_stock || 'und'}</p>
        <div style="text-align:left; display:flex; flex-direction:column; gap:10px;">
          <select id="swal-tipo-mov" class="input-glass" style="width:100%;">
            <option value="entrada_compra">Entrada: Compra</option>
            <option value="entrada_ajuste">Entrada: Ajuste</option>
            <option value="salida_ajuste">Salida: Ajuste</option>
            <option value="devolucion">Devolución</option>
          </select>
          <input id="swal-cantidad" class="input-glass" type="number" placeholder="Cantidad *" min="0.01" step="0.01" style="width:100%;">
          <input id="swal-motivo" class="input-glass" placeholder="Motivo" style="width:100%;">
          <input id="swal-costo" class="input-glass" type="number" placeholder="Costo unitario (opcional)" min="0" step="0.01" style="width:100%;">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0891B2',
      preConfirm: () => {
        const cantidad = +(document.getElementById('swal-cantidad') as HTMLInputElement).value;
        if (!cantidad || cantidad <= 0) { this.alert.showValidationMessage('Cantidad inválida'); return; }
        return {
          producto_id: producto.id,
          tipo: (document.getElementById('swal-tipo-mov') as HTMLSelectElement).value,
          cantidad,
          motivo: (document.getElementById('swal-motivo') as HTMLInputElement).value.trim() || undefined,
          costo: +(document.getElementById('swal-costo') as HTMLInputElement).value || undefined,
        };
      },
    });

    if (!formValues) return;

    this.platformService.registrarMovimiento(formValues).subscribe({
      next: (resp) => {
        this.alert.success(resp.mensaje);
        this.cargarDatos();
        if (this.vista === 'movimientos') this.cargarMovimientos(this.productoSelId || undefined);
      },
      error: (err) => this.alert.error(err?.error?.message || 'Error'),
    });
  }

  // ── Imprimir ticket de inventario ──
  imprimirTicket(area: string): void {
    this.showPrintMenu = false;
    this.pdfService.imprimirInventario(area);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.print-dropdown')) {
      this.showPrintMenu = false;
    }
  }

  // ── Toma de inventario ──
  initToma(): void {
    this.tomaItems = this.productos.map(p => ({
      producto: p,
      conteo: null,
    }));
  }

  async confirmarToma(): Promise<void> {
    const itemsConConteo = this.tomaItems.filter(i => i.conteo !== null && i.conteo !== undefined);

    if (!itemsConConteo.length) {
      this.alert.info('Ingresa al menos un conteo físico');
      return;
    }

    const conDiferencia = itemsConConteo.filter(i => Number(i.conteo) !== Number(i.producto.stock));

    const { isConfirmed } = await this.alert.fire({
      title: 'Confirmar toma de inventario',
      html: `
        <div style="text-align:left; font-size:14px;">
          <p><strong>${itemsConConteo.length}</strong> insumos contados</p>
          <p><strong>${conDiferencia.length}</strong> con diferencia (se ajustarán)</p>
          <p><strong>${itemsConConteo.length - conDiferencia.length}</strong> sin cambios</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0891B2',
    });

    if (!isConfirmed) return;

    this.guardandoToma = true;
    const items = itemsConConteo.map(i => ({
      producto_id: i.producto.id,
      conteo_fisico: Number(i.conteo),
    }));

    this.platformService.registrarTomaInventario(items).subscribe({
      next: (resp) => {
        this.guardandoToma = false;
        this.alert.fire({
          icon: 'success',
          title: 'Toma registrada',
          html: `<p>${resp.ajustes ?? 0} ajustes realizados</p><p>${resp.sinCambio ?? 0} sin cambio</p>`,
          timer: 3000,
          showConfirmButton: false,
          timerProgressBar: true,
        });
        this.cargarDatos();
        this.vista = 'productos';
      },
      error: (err) => {
        this.guardandoToma = false;
        this.alert.error(err?.error?.message || 'Error al registrar toma');
      },
    });
  }
}
