import { Component, OnInit, HostListener } from '@angular/core';
import { PlatformService } from '../../services/platform.service';
import { PdfService } from '../../services/pdf.service';
import { Plato, Categoria, PedidoItem, Mesa, FacturaActivaMesa, EnviarComandaResponse, DetalleAccionResponse, ApiResponse } from '../../../shared/interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-servicio',
  templateUrl: './servicio.component.html',
  styleUrls: ['./servicio.component.css']
})
export class ServicioComponent implements OnInit {

  Math = Math; // Exponer para uso en template

  categorias: Categoria[] = [];
  productos: Plato[] = [];
  productosFiltrados: Plato[] = [];

  // Items ya comandados (de la factura guardada)
  itemsFactura: PedidoItem[] = [];

  // Items nuevos seleccionados (aún no enviados)
  seleccionados: PedidoItem[] = [];

  // Mesas disponibles (para transferencia)
  mesasDisponibles: Mesa[] = [];

  mesaId = '';
  mesaNumero = 0;
  mesero = '';
  facturaId = '';
  categoriaActiva = '';
  loading = true;
  enviando = false;

  // Item seleccionado de la cuenta (para acciones del panel inferior)
  itemSeleccionado: PedidoItem | null = null;

  // Descuento general de mesa (viene del backend)
  facturaDescuento = 0;
  facturaSubtotalBackend = 0;

  // Panel de cobro (estado de visibilidad)
  mostrarCobro = false;

  // Mobile tab navigation
  mobileActiveTab: 'carta' | 'pedido' | 'cuenta' = 'carta';

  // Chips overflow
  showMoreCats = false;
  private readonly MAX_VISIBLE_CHIPS = 4;

  get categoriasVisibles(): Categoria[] {
    return this.categorias.slice(0, this.MAX_VISIBLE_CHIPS);
  }

  get categoriasOverflow(): Categoria[] {
    return this.categorias.slice(this.MAX_VISIBLE_CHIPS);
  }

  constructor(
    private platformService: PlatformService,
    private pdfService: PdfService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alert: AlertService,
    private authService: AuthService,
  ) { }

  get canCobrar(): boolean { return this.authService.canCobrar; }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.mesaId = params['id'];
      this.cargarDatos();
    });
  }

  cargarDatos(): void {
    this.loading = true;
    this.cargarCategoria();
    this.cargarCarta();
    this.cargarFactura();
  }

  cargarCategoria(): void {
    this.platformService.getCategorias().subscribe({
      next: cats => this.categorias = cats
    });
  }

  cargarCarta(): void {
    this.platformService.getCarta().subscribe({
      next: carta => {
        this.productos = carta.filter(p => p.disponibilidad);
        this.productosFiltrados = [...this.productos];
      }
    });
  }

  cargarFactura(): void {
    this.platformService.getFacturaActivaMesa(this.mesaId).subscribe({
      next: (factura: FacturaActivaMesa) => {
        this.loading = false;
        if (factura) {
          this.facturaId = factura.id;
          this.mesaNumero = factura.mesa_numero || 0;
          this.mesero = factura.mesero || '';
          this.facturaDescuento = Number(factura.descuento_monto) || 0;
          this.facturaSubtotalBackend = Number(factura.subtotal) || 0;
          this.itemsFactura = (factura.items || [])
            .filter((d) => d.estado_pedido !== 'anulado')
            .map((d) => ({
              id: d.id,
              plato_id: d.plato_id,
              plato_nombre: d.plato_nombre || d.plato?.nombre || '',
              cantidad: d.cantidad,
              precio: d.precio_unitario || d.precio || 0,
              area: d.area || '',
              estado_pedido: d.estado_pedido || 'pendiente',
              hora_pedido: d.hora_pedido || d.created_at || '',
              descuento_porcentaje: Number(d.descuento_porcentaje) || 0,
              descuento_monto: Number(d.descuento_monto) || 0,
            }))
            .sort((a: PedidoItem, b: PedidoItem) => new Date(b.hora_pedido!).getTime() - new Date(a.hora_pedido!).getTime());
        }
      },
      error: () => { this.loading = false; }
    });
  }

  // ══════════════════════════════════════════════════════
  // Cálculos
  // ══════════════════════════════════════════════════════

  get subtotalFactura(): number {
    return this.itemsFactura.reduce((t, i) => t + (i.precio * i.cantidad) - (i.descuento_monto || 0), 0);
  }

  get totalDescuentosItems(): number {
    return this.itemsFactura.reduce((t, i) => t + (i.descuento_monto || 0), 0);
  }

  get subtotalNuevo(): number {
    return this.seleccionados.reduce((t, i) => t + (i.precio * i.cantidad), 0);
  }

  get totalItemsNuevos(): number {
    return this.seleccionados.reduce((t, i) => t + i.cantidad, 0);
  }

  get totalGeneral(): number {
    return this.subtotalFactura + this.subtotalNuevo;
  }

  /** Subtotal bruto menos descuentos (usado en modales de descuento/cortesía) */
  get cobroSubtotal(): number {
    const bruto = this.itemsFactura.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
    return Math.max(0, bruto - this.totalDescuentosItems - this.facturaDescuento);
  }

  // ══════════════════════════════════════════════════════
  // Selección de item en la cuenta (para panel de acciones)
  // ══════════════════════════════════════════════════════

  seleccionarItemCuenta(item: PedidoItem): void {
    if (this.itemSeleccionado?.id === item.id) {
      this.itemSeleccionado = null; // deseleccionar si ya estaba
    } else {
      this.itemSeleccionado = item;
    }
  }

  get totalItems(): number {
    return this.itemsFactura.reduce((t, i) => t + i.cantidad, 0) +
      this.seleccionados.reduce((t, i) => t + i.cantidad, 0);
  }

  // ══════════════════════════════════════════════════════
  // Selección de productos (nuevo pedido)
  // ══════════════════════════════════════════════════════

  seleccionarProducto(producto: Plato): void {
    const existente = this.seleccionados.find(p => p.plato_id === producto.id);
    if (existente) {
      existente.cantidad += 1;
    } else {
      this.seleccionados.push({
        plato_id: producto.id,
        plato_nombre: producto.nombre,
        cantidad: 1,
        precio: producto.precio_venta,
        area: producto.area,
      });
    }
    this.seleccionados = [...this.seleccionados];
  }

  quitarUno(item: PedidoItem): void {
    const idx = this.seleccionados.indexOf(item);
    if (idx >= 0) {
      if (item.cantidad > 1) {
        item.cantidad -= 1;
        this.seleccionados = [...this.seleccionados];
      } else {
        this.seleccionados.splice(idx, 1);
        this.seleccionados = [...this.seleccionados];
      }
    }
  }

  agregarUno(item: PedidoItem): void {
    item.cantidad += 1;
    this.seleccionados = [...this.seleccionados];
  }

  eliminarSeleccionado(item: PedidoItem): void {
    const idx = this.seleccionados.indexOf(item);
    if (idx >= 0) {
      this.seleccionados.splice(idx, 1);
      this.seleccionados = [...this.seleccionados];
    }
  }

  comentario(pedido: PedidoItem): void {
    this.alert.fire({
      title: 'Agregar Comentario',
      input: 'textarea',
      inputValue: pedido.comentario || '',
      inputPlaceholder: 'Ej: sin cebolla, bien cocido...',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (result.isConfirmed) {
        pedido.comentario = result.value;
      }
    });
  }

  // ══════════════════════════════════════════════════════
  // Filtros
  // ══════════════════════════════════════════════════════

  filtrarPlatos(event: KeyboardEvent): void {
    const filtro = (event.target as HTMLInputElement).value.toLowerCase();
    this.productosFiltrados = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(filtro)
    );
    this.categoriaActiva = '';
  }

  filtrarPorCategoria(categoria: Categoria): void {
    if (this.categoriaActiva === categoria.nombre) {
      this.productosFiltrados = [...this.productos];
      this.categoriaActiva = '';
    } else {
      this.productosFiltrados = this.productos.filter(p =>
        p.categoria?.nombre === categoria.nombre
      );
      this.categoriaActiva = categoria.nombre;
    }
  }

  mostrarTodos(): void {
    this.productosFiltrados = [...this.productos];
    this.categoriaActiva = '';
  }

  toggleMoreCats(event: Event): void {
    event.stopPropagation();
    this.showMoreCats = !this.showMoreCats;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showMoreCats = false;
  }

  // ══════════════════════════════════════════════════════
  // Enviar comanda
  // ══════════════════════════════════════════════════════

  comandar(): void {
    if (this.seleccionados.length === 0 || !this.facturaId || this.enviando) return;

    this.enviando = true;

    const items = this.seleccionados.map(s => ({
      plato_id: s.plato_id,
      cantidad: s.cantidad,
      comentario: s.comentario,
    }));

    this.platformService.enviarComanda(this.facturaId, items).subscribe({
      next: (res: EnviarComandaResponse) => {
        const comandas = res.comandas || [];
        for (const comanda of comandas) {
          this.imprimirComandaPdf(comanda.id);
        }

        // Recargar factura desde el servidor para tener IDs reales
        this.cargarFactura();
        this.seleccionados = [];
        this.enviando = false;

        this.alert.success(`Comanda enviada — ${comandas.length} comanda(s) generada(s)`);
      },
      error: (err) => {
        this.enviando = false;
        this.alert.error(err?.error?.message || 'No se pudo enviar la comanda');
      }
    });
  }

  // ══════════════════════════════════════════════════════
  // 1. ANULAR ITEM
  // ══════════════════════════════════════════════════════
  anularItem(item: PedidoItem): void {
    if (!item.id) return;

    this.alert.fire({
      title: 'Anular Item',
      html: `<p>¿Anular <strong>${item.cantidad}x ${item.plato_nombre}</strong>?</p>
             <p style="font-size:13px;color:#888;">Esto eliminará el item de la cuenta y quedará registrado.</p>`,
      input: 'text',
      inputPlaceholder: 'Motivo de anulación (obligatorio)',
      inputValidator: (value) => {
        if (!value || value.trim().length < 3) return 'Ingresa un motivo válido (mín. 3 caracteres)';
        return null;
      },
      showCancelButton: true,
      confirmButtonText: 'Anular',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      icon: 'warning',
    }).then(result => {
      if (result.isConfirmed && result.value) {
        this.platformService.anularDetalle(item.id!, result.value).subscribe({
          next: (res: DetalleAccionResponse) => {
            this.itemsFactura = this.itemsFactura.filter(i => i.id !== item.id);
            this.itemSeleccionado = null;
            this.alert.success(res.mensaje, 2000);
            if (res.comanda_id) {
              this.imprimirComandaPdf(res.comanda_id);
            }
          },
          error: (err) => {
            this.alert.error(err?.error?.message || 'No se pudo anular');
          }
        });
      }
    });
  }

  // ══════════════════════════════════════════════════════
  // 2. AJUSTAR CANTIDAD
  // ══════════════════════════════════════════════════════
  ajustarCantidad(item: PedidoItem): void {
    if (!item.id) return;

    this.alert.fire({
      title: 'Ajustar Cantidad',
      html: `<p><strong>${item.plato_nombre}</strong></p>
             <p>Cantidad actual: <strong>${item.cantidad}</strong></p>
             <p style="font-size:13px;color:#888;">Ingresa la nueva cantidad (menor a ${item.cantidad}). La diferencia se registrará como anulación parcial.</p>`,
      input: 'number',
      inputValue: item.cantidad - 1,
      inputAttributes: {
        min: '0',
        max: String(item.cantidad - 1),
        step: '1',
      },
      inputValidator: (value) => {
        const num = Number(value);
        if (isNaN(num) || num < 0) return 'Cantidad inválida';
        if (num >= item.cantidad) return `Debe ser menor a ${item.cantidad}`;
        return null;
      },
      showCancelButton: true,
      confirmButtonText: 'Siguiente',
      cancelButtonText: 'Cancelar',
    }).then(cantResult => {
      if (!cantResult.isConfirmed) return;

      const nuevaCantidad = Number(cantResult.value);
      const diferencia = item.cantidad - nuevaCantidad;

      this.alert.fire({
        title: 'Motivo del ajuste',
        html: `<p>Se anularán <strong>${diferencia}</strong> unidad(es) de <strong>${item.plato_nombre}</strong></p>`,
        input: 'text',
        inputPlaceholder: 'Motivo (obligatorio)',
        inputValidator: (value) => {
          if (!value || value.trim().length < 3) return 'Ingresa un motivo válido';
          return null;
        },
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        confirmButtonColor: '#f59e0b',
      }).then(motivoResult => {
        if (!motivoResult.isConfirmed || !motivoResult.value) return;

        this.platformService.ajustarCantidadDetalle(item.id!, nuevaCantidad, motivoResult.value).subscribe({
          next: (res: DetalleAccionResponse) => {
            if (nuevaCantidad === 0) {
              this.itemsFactura = this.itemsFactura.filter(i => i.id !== item.id);
            } else {
              item.cantidad = nuevaCantidad;
              this.itemsFactura = [...this.itemsFactura];
            }
            this.itemSeleccionado = null;
            this.alert.success(res.mensaje, 2000);
            if (res.comanda_id) {
              this.imprimirComandaPdf(res.comanda_id);
            }
          },
          error: (err) => {
            this.alert.error(err?.error?.message || 'No se pudo ajustar');
          }
        });
      });
    });
  }

  // ══════════════════════════════════════════════════════
  // 3. TRANSFERIR ITEM(S) A OTRA MESA
  // ══════════════════════════════════════════════════════
  transferirItem(item: PedidoItem): void {
    if (!item.id) return;

    // Cargar mesas disponibles
    this.platformService.getMesas().subscribe({
      next: (mesas: Mesa[]) => {
        // Excluir la mesa actual
        const otherMesas = mesas.filter(m => m.id !== this.mesaId);

        if (otherMesas.length === 0) {
          this.alert.info('No hay otras mesas disponibles');
          return;
        }

        // Generar opciones para el selector
        const inputOptions: Record<string, string> = {};
        for (const mesa of otherMesas) {
          const estado = mesa.estado === 'ocupada' ? '🔴' : '🟢';
          inputOptions[mesa.id] = `${estado} Mesa ${mesa.numero}`;
        }

        this.alert.fire({
          title: 'Transferir a otra mesa',
          html: `<p>Mover <strong>${item.cantidad}x ${item.plato_nombre}</strong></p>
                 <p style="font-size:13px;color:#888;">🟢 = libre (se abrirá cuenta nueva) · 🔴 = ocupada (se agrega a su cuenta)</p>`,
          input: 'select',
          inputOptions,
          inputPlaceholder: 'Selecciona mesa destino',
          inputValidator: (value) => {
            if (!value) return 'Selecciona una mesa';
            return null;
          },
          showCancelButton: true,
          confirmButtonText: 'Transferir',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#3b82f6',
        }).then(result => {
          if (!result.isConfirmed || !result.value) return;

          const mesaDestinoId = result.value;

          this.platformService.transferirItems([item.id!], mesaDestinoId).subscribe({
            next: (res: ApiResponse) => {
              this.itemsFactura = this.itemsFactura.filter(i => i.id !== item.id);
              this.itemSeleccionado = null;
              this.alert.success(res.mensaje, 2000);
            },
            error: (err) => {
              this.alert.error(err?.error?.message || 'No se pudo transferir');
            }
          });
        });
      }
    });
  }

  // ══════════════════════════════════════════════════════
  // Impresión PDF
  // ══════════════════════════════════════════════════════

  imprimirComandaPdf(comandaId: string): void {
    this.pdfService.imprimirComanda(comandaId)
      .catch(err => console.error('Error al abrir PDF comanda:', err));
  }

  liberarMesa(): void {
    this.alert.fire({
      title: 'Liberar mesa',
      text: `¿Liberar Mesa ${this.mesaNumero}? Se eliminará la cuenta vacía.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, liberar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    }).then(result => {
      if (result.isConfirmed) {
        this.platformService.liberarMesa(this.mesaId).subscribe({
          next: () => {
            this.alert.success('Mesa liberada');
            this.router.navigate(['/home/mesas']);
          },
          error: (err) => {
            this.alert.error(err?.error?.message || 'No se pudo liberar la mesa');
          }
        });
      }
    });
  }

  // ══════════════════════════════════════════════════════
  // DESCUENTOS (desde action bar)
  // ══════════════════════════════════════════════════════
  private _descuentoModalHtml(label: string, monto: number): string {
    return `
      <div style="text-align:center; margin-bottom:16px;">
        <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(0,0,0,0.04); padding:8px 20px; border-radius:20px; font-size:14px; color:#555;">
          <span style="font-weight:600;">${label}</span>
          <span style="color:#888;">•</span>
          <span style="font-weight:700; color:#222;">$${monto.toLocaleString()}</span>
        </div>
      </div>

      <div style="margin-bottom:14px;">
        <label style="display:block; font-size:12px; font-weight:600; color:#888; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">Tipo de descuento</label>
        <div style="display:flex; border:1px solid #e0e0e0; border-radius:10px; overflow:hidden;" id="swal-tipo-group">
          <button type="button" id="swal-btn-pct" onclick="document.getElementById('swal-tipo').value='porcentaje'; document.getElementById('swal-btn-pct').classList.add('swal-tab-active'); document.getElementById('swal-btn-val').classList.remove('swal-tab-active'); document.getElementById('swal-lbl-suffix').textContent='%';"
            class="swal-tab-active"
            style="flex:1; padding:10px; border:none; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.15s; background:#8b5cf6; color:#fff;">
            % Porcentaje
          </button>
          <button type="button" id="swal-btn-val" onclick="document.getElementById('swal-tipo').value='valor'; document.getElementById('swal-btn-val').classList.add('swal-tab-active'); document.getElementById('swal-btn-pct').classList.remove('swal-tab-active'); document.getElementById('swal-lbl-suffix').textContent='$';"
            style="flex:1; padding:10px; border:none; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.15s; background:#f5f5f5; color:#888;">
            $ Valor fijo
          </button>
        </div>
        <input type="hidden" id="swal-tipo" value="porcentaje">
      </div>

      <div style="margin-bottom:8px;">
        <label style="display:block; font-size:12px; font-weight:600; color:#888; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">Rápido</label>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button type="button" onclick="document.getElementById('swal-valor').value='5'" style="padding:6px 14px; border:1px solid #e0e0e0; border-radius:8px; background:#fff; font-size:13px; font-weight:600; cursor:pointer; color:#555;">5</button>
          <button type="button" onclick="document.getElementById('swal-valor').value='10'" style="padding:6px 14px; border:1px solid #e0e0e0; border-radius:8px; background:#fff; font-size:13px; font-weight:600; cursor:pointer; color:#555;">10</button>
          <button type="button" onclick="document.getElementById('swal-valor').value='15'" style="padding:6px 14px; border:1px solid #e0e0e0; border-radius:8px; background:#fff; font-size:13px; font-weight:600; cursor:pointer; color:#555;">15</button>
          <button type="button" onclick="document.getElementById('swal-valor').value='20'" style="padding:6px 14px; border:1px solid #e0e0e0; border-radius:8px; background:#fff; font-size:13px; font-weight:600; cursor:pointer; color:#555;">20</button>
          <button type="button" onclick="document.getElementById('swal-valor').value='25'" style="padding:6px 14px; border:1px solid #e0e0e0; border-radius:8px; background:#fff; font-size:13px; font-weight:600; cursor:pointer; color:#555;">25</button>
          <button type="button" onclick="document.getElementById('swal-valor').value='50'" style="padding:6px 14px; border:1px solid #e0e0e0; border-radius:8px; background:#fff; font-size:13px; font-weight:600; cursor:pointer; color:#555;">50</button>
        </div>
      </div>

      <div>
        <label style="display:block; font-size:12px; font-weight:600; color:#888; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">Valor</label>
        <div style="display:flex; align-items:center; gap:4px; border:1px solid #e0e0e0; border-radius:10px; padding:4px 12px; background:#fafafa;">
          <input id="swal-valor" type="number" min="0" placeholder="0" style="flex:1; border:none; outline:none; font-size:18px; font-weight:700; background:transparent; padding:8px 0; color:#222;">
          <span id="swal-lbl-suffix" style="font-size:16px; font-weight:700; color:#8b5cf6;">%</span>
        </div>
      </div>

      <style>
        .swal-tab-active { background:#8b5cf6 !important; color:#fff !important; }
        button:not(.swal-tab-active)[id^="swal-btn"] { background:#f5f5f5 !important; color:#888 !important; }
      </style>
    `;
  }

  async descuentoItem(): Promise<void> {
    if (!this.itemSeleccionado) return;
    const item = this.itemSeleccionado;
    const totalItem = item.precio * item.cantidad;

    const { value: formValues } = await this.alert.fire({
      title: `Descuento Item`,
      html: this._descuentoModalHtml(item.plato_nombre, totalItem),
      showCancelButton: true,
      confirmButtonText: '✓ Aplicar descuento',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#8b5cf6',
      width: 420,
      preConfirm: () => {
        const tipo = (document.getElementById('swal-tipo') as HTMLInputElement).value;
        const valor = Number((document.getElementById('swal-valor') as HTMLInputElement).value);
        if (!valor || valor <= 0) { this.alert.showValidationMessage('Ingresa un valor válido'); return; }
        if (tipo === 'porcentaje' && valor > 100) { this.alert.showValidationMessage('El porcentaje no puede ser mayor a 100'); return; }
        return { tipo, valor };
      }
    });

    if (!formValues) return;
    const fv = formValues as { tipo: string; valor: number };
    this.platformService.descuentoItem(item.id!, fv.tipo as 'porcentaje' | 'valor', fv.valor).subscribe({
      next: () => {
        this.alert.success(`Descuento aplicado — ${item.plato_nombre}`);
        this.cargarFactura();
      },
      error: (err) => this.alert.error(err?.error?.message || 'No se pudo aplicar'),
    });
  }

  async descuentoMesa(): Promise<void> {
    if (!this.facturaId) return;

    const { value: formValues } = await this.alert.fire({
      title: `Descuento Mesa ${this.mesaNumero}`,
      html: this._descuentoModalHtml('Subtotal mesa', this.cobroSubtotal),
      showCancelButton: true,
      confirmButtonText: '✓ Aplicar descuento',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#8b5cf6',
      width: 420,
      preConfirm: () => {
        const tipo = (document.getElementById('swal-tipo') as HTMLInputElement).value;
        const valor = Number((document.getElementById('swal-valor') as HTMLInputElement).value);
        if (!valor || valor <= 0) { this.alert.showValidationMessage('Ingresa un valor válido'); return; }
        if (tipo === 'porcentaje' && valor > 100) { this.alert.showValidationMessage('El porcentaje no puede ser mayor a 100'); return; }
        return { tipo, valor };
      }
    });

    if (!formValues) return;
    const fv = formValues as { tipo: string; valor: number };
    this.platformService.descuentoMesa(this.facturaId, fv.tipo as 'porcentaje' | 'valor', fv.valor).subscribe({
      next: () => {
        this.alert.success('Descuento de mesa aplicado');
        this.cargarFactura();
      },
      error: (err) => this.alert.error(err?.error?.message || 'No se pudo aplicar'),
    });
  }

  // ══════════════════════════════════════════════════════
  // CORTESÍA (100% descuento)
  // ══════════════════════════════════════════════════════
  async cortesiaItem(): Promise<void> {
    if (!this.itemSeleccionado) return;
    const item = this.itemSeleccionado;
    const totalItem = item.precio * item.cantidad;

    const result = await this.alert.fire({
      title: '',
      html: `
        <div style="text-align:center; padding:4px 0 0;">
          <div style="width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg, #22D3EE 0%, #0891B2 100%); display:inline-flex; align-items:center; justify-content:center; margin-bottom:12px;">
            <span class="material-icons" style="font-size:28px; color:#fff;">card_giftcard</span>
          </div>
          <div style="font-size:18px; font-weight:700; color:#0f172a; margin-bottom:2px;">Cortesía de Item</div>
          <div style="display:inline-flex; align-items:center; gap:8px; background:#edf1f7; padding:6px 16px; border-radius:20px; font-size:13px; color:#64748b; margin-top:8px;">
            <span style="font-weight:600; color:#0f172a;">${item.plato_nombre}</span>
            <span>•</span>
            <span>x${item.cantidad}</span>
            <span>•</span>
            <span style="font-weight:700; color:#0f172a;">$${totalItem.toLocaleString()}</span>
          </div>
          <div style="margin-top:16px; padding:14px 16px; background:linear-gradient(135deg, rgba(34,211,238,0.06) 0%, rgba(22,163,74,0.06) 100%); border:1px solid rgba(22,163,74,0.15); border-radius:12px;">
            <div style="display:flex; align-items:center; gap:8px; justify-content:center;">
              <span class="material-icons" style="font-size:18px; color:#16a34a;">verified</span>
              <span style="color:#16a34a; font-size:13px; font-weight:600;">100% descuento — Cortesía de la casa</span>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '<span class="material-icons" style="font-size:16px; vertical-align:middle; margin-right:4px;">card_giftcard</span> Confirmar cortesía',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0891B2',
      width: 420,
    });

    if (!result.isConfirmed) return;
    this.platformService.descuentoItem(item.id!, 'porcentaje', 100).subscribe({
      next: () => {
        this.alert.success(`¡Cortesía aplicada! ${item.plato_nombre}`);
        this.cargarFactura();
      },
      error: (err) => this.alert.error(err?.error?.message || 'No se pudo aplicar'),
    });
  }

  async cortesiaMesa(): Promise<void> {
    if (!this.facturaId) return;

    const result = await this.alert.fire({
      title: '',
      html: `
        <div style="text-align:center; padding:4px 0 0;">
          <div style="width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg, #5D55FA 0%, #22D3EE 100%); display:inline-flex; align-items:center; justify-content:center; margin-bottom:12px;">
            <span class="material-icons" style="font-size:28px; color:#fff;">table_restaurant</span>
          </div>
          <div style="font-size:18px; font-weight:700; color:#0f172a; margin-bottom:2px;">Cortesía de Mesa</div>
          <div style="display:inline-flex; align-items:center; gap:8px; background:#edf1f7; padding:6px 16px; border-radius:20px; font-size:13px; color:#64748b; margin-top:8px;">
            <span style="font-weight:600; color:#0f172a;">Mesa ${this.mesaNumero}</span>
            <span>•</span>
            <span style="font-weight:700; color:#0f172a;">$${this.cobroSubtotal.toLocaleString()}</span>
          </div>
          <div style="margin-top:16px; padding:14px 16px; background:rgba(220,38,38,0.05); border:1px solid rgba(220,38,38,0.15); border-radius:12px;">
            <div style="display:flex; align-items:center; gap:8px; justify-content:center;">
              <span class="material-icons" style="font-size:18px; color:#dc2626;">warning_amber</span>
              <span style="color:#dc2626; font-size:13px; font-weight:600;">Toda la cuenta será cortesía (100% descuento)</span>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '<span class="material-icons" style="font-size:16px; vertical-align:middle; margin-right:4px;">card_giftcard</span> Confirmar cortesía total',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0891B2',
      width: 420,
    });

    if (!result.isConfirmed) return;
    this.platformService.descuentoMesa(this.facturaId, 'porcentaje', 100).subscribe({
      next: () => {
        this.alert.success(`¡Cortesía de mesa aplicada! Mesa ${this.mesaNumero} — 100% descuento`);
        this.cargarFactura();
      },
      error: (err) => this.alert.error(err?.error?.message || 'No se pudo aplicar'),
    });
  }

  async abrirCortesia(): Promise<void> {
    const hasItem = !!this.itemSeleccionado;
    const itemName = hasItem ? this.itemSeleccionado!.plato_nombre : '';

    const result = await this.alert.fire({
      title: '',
      html: `
        <div style="text-align:center; padding:4px 0 12px;">
          <div style="width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg, #22D3EE 0%, #16a34a 100%); display:inline-flex; align-items:center; justify-content:center; margin-bottom:12px;">
            <span class="material-icons" style="font-size:28px; color:#fff;">card_giftcard</span>
          </div>
          <div style="font-size:18px; font-weight:700; color:#0f172a;">Cortesía</div>
          <div style="font-size:13px; color:#64748b; margin-top:2px;">Selecciona el tipo de cortesía</div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px; padding:0 4px;">
          <button type="button" id="swal-cort-item"
            ${!hasItem ? 'disabled' : ''}
            style="display:flex; align-items:center; gap:14px; padding:16px 18px; border:2px solid #e2e8f0; border-radius:14px; background:#fff; cursor:${hasItem ? 'pointer' : 'not-allowed'}; opacity:${hasItem ? '1' : '0.35'}; transition:all 0.2s ease; text-align:left; width:100%; box-sizing:border-box;">
            <div style="width:42px; height:42px; border-radius:12px; background:linear-gradient(135deg, rgba(34,211,238,0.12) 0%, rgba(8,145,178,0.12) 100%); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <span class="material-icons" style="font-size:22px; color:#0891B2;">restaurant_menu</span>
            </div>
            <div style="flex:1; min-width:0;">
              <div style="font-size:14px; font-weight:700; color:#0f172a;">Cortesía de Item</div>
              <div style="font-size:12px; color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${hasItem ? itemName : 'Selecciona un item primero'}</div>
            </div>
            <span class="material-icons" style="font-size:20px; color:#cbd5e1;">chevron_right</span>
          </button>

          <button type="button" id="swal-cort-mesa"
            style="display:flex; align-items:center; gap:14px; padding:16px 18px; border:2px solid #e2e8f0; border-radius:14px; background:#fff; cursor:pointer; transition:all 0.2s ease; text-align:left; width:100%; box-sizing:border-box;">
            <div style="width:42px; height:42px; border-radius:12px; background:linear-gradient(135deg, rgba(93,85,250,0.12) 0%, rgba(34,211,238,0.12) 100%); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <span class="material-icons" style="font-size:22px; color:#5D55FA;">table_restaurant</span>
            </div>
            <div style="flex:1; min-width:0;">
              <div style="font-size:14px; font-weight:700; color:#0f172a;">Cortesía de Mesa</div>
              <div style="font-size:12px; color:#64748b;">Mesa ${this.mesaNumero} — $${this.cobroSubtotal.toLocaleString()}</div>
            </div>
            <span class="material-icons" style="font-size:20px; color:#cbd5e1;">chevron_right</span>
          </button>
        </div>

        <input type="hidden" id="swal-cort-choice" value="">
        <style>
          #swal-cort-item:not(:disabled):hover,
          #swal-cort-mesa:hover {
            border-color: #22D3EE !important;
            background: linear-gradient(135deg, rgba(34,211,238,0.04) 0%, rgba(22,163,74,0.04) 100%) !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(34,211,238,0.15);
          }
          .swal-cort-selected {
            border-color: #0891B2 !important;
            background: linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(8,145,178,0.06) 100%) !important;
            box-shadow: 0 0 0 3px rgba(34,211,238,0.15), 0 4px 12px rgba(34,211,238,0.12) !important;
          }
        </style>
      `,
      showCancelButton: true,
      confirmButtonText: '<span class="material-icons" style="font-size:16px; vertical-align:middle; margin-right:4px;">arrow_forward</span> Continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0891B2',
      width: 420,
      didOpen: () => {
        const itemBtn = document.getElementById('swal-cort-item');
        const mesaBtn = document.getElementById('swal-cort-mesa');
        const choice = document.getElementById('swal-cort-choice') as HTMLInputElement;

        const clearSelection = () => {
          itemBtn?.classList.remove('swal-cort-selected');
          mesaBtn?.classList.remove('swal-cort-selected');
        };

        itemBtn?.addEventListener('click', () => {
          if (itemBtn.hasAttribute('disabled')) return;
          clearSelection();
          itemBtn.classList.add('swal-cort-selected');
          choice.value = 'item';
        });

        mesaBtn?.addEventListener('click', () => {
          clearSelection();
          mesaBtn.classList.add('swal-cort-selected');
          choice.value = 'mesa';
        });
      },
      preConfirm: () => {
        const choice = (document.getElementById('swal-cort-choice') as HTMLInputElement).value;
        if (!choice) { this.alert.showValidationMessage('Selecciona una opción'); return; }
        return choice;
      }
    });

    if (!result.value) return;
    if (result.value === 'item') {
      this.cortesiaItem();
    } else {
      this.cortesiaMesa();
    }
  }

  // ══════════════════════════════════════════════════════
  // PRECUENTA / VERIFICADORA
  // ══════════════════════════════════════════════════════
  verificarCuenta(): void {
    if (!this.facturaId) return;

    this.alert.fire({
      title: '',
      html: `
        <div style="text-align:center; padding:16px 0;">
          <div style="width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg, #5D55FA 0%, #22D3EE 100%); display:inline-flex; align-items:center; justify-content:center; margin-bottom:12px;">
            <span class="material-icons" style="font-size:24px; color:#fff;">receipt</span>
          </div>
          <div style="font-size:15px; font-weight:600; color:#0f172a;">Generando precuenta...</div>
          <div style="font-size:12px; color:#64748b; margin-top:4px;">Mesa ${this.mesaNumero}</div>
        </div>
      `,
      showConfirmButton: false,
      allowOutsideClick: false,
    });

    this.pdfService.imprimirPrecuenta(this.facturaId)
      .then(() => this.alert.close())
      .catch(err => {
        this.alert.error(err?.message || 'No se pudo generar la precuenta');
      });
  }

  // ══════════════════════════════════════════════════════
  // PANEL DE COBRO
  // ══════════════════════════════════════════════════════
  abrirCobro(): void {
    if (this.itemsFactura.length === 0) {
      this.alert.warning('No hay items para cobrar');
      return;
    }
    this.mostrarCobro = true;
  }

  cerrarCobro(): void {
    this.mostrarCobro = false;
  }

  onCobroExitoso(): void {
    this.mostrarCobro = false;
    this.router.navigate(['/home/mesas']);
  }
}
