import { Component, OnInit } from '@angular/core';
import { PlatformService } from '../../services/platform.service';
import { Factura, DetalleFactura } from '../../../shared/interfaces';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.css']
})
export class FacturaComponent implements OnInit {

  displayedColumnsFactura: string[] = ['plato', 'precio', 'cantidad', 'total'];
  dataSourceFactura = new MatTableDataSource<DetalleFactura>();
  facturaId = '';
  factura!: Factura;
  correcciones: any[] = [];

  constructor(
    private platformService: PlatformService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alert: AlertService,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        switchMap(({ id }) => {
          this.facturaId = id;
          return this.platformService.getFactura(this.facturaId);
        })
      )
      .subscribe(factura => {
        this.factura = factura;
        if (factura.detalles) {
          this.dataSourceFactura.data = factura.detalles;
        }
        this.loadCorrecciones();
      });
  }

  loadCorrecciones(): void {
    if (this.factura?.estado === 'cerrada' || this.factura?.numero_factura) {
      this.platformService.getCorrecciones(this.facturaId).subscribe({
        next: (data) => this.correcciones = data || [],
        error: () => this.correcciones = [],
      });
    }
  }

  get meseroNombre(): string {
    if (!this.factura?.empleado) return '';
    return `${this.factura.empleado.nombre} ${this.factura.empleado.apellido1}`;
  }

  get clienteNombre(): string {
    if (!this.factura?.cliente) return 'General';
    return `${this.factura.cliente.nombre} ${this.factura.cliente.apellido1}`;
  }

  formatMoney(val: any): string {
    return (Number(val) || 0).toLocaleString('es-CO');
  }

  // ── CORREGIR FACTURA (método de pago y/o servicio) ──
  async corregirFactura(): Promise<void> {
    if (this.factura.estado !== 'cerrada') return;

    const metodoActual = this.factura.metodo_pago || 'efectivo';
    const servicioActual = Number(this.factura.propina) || 0;

    const result = await this.alert.fire({
      title: 'Corregir Factura',
      html: `
        <div style="text-align: left; margin-bottom: 12px;">
          <p style="margin-bottom: 16px; color: #94a3b8; font-size: 13px;">
            <strong>${this.factura.numero_factura}</strong> — Mesa ${this.factura.mesa?.numero || ''}
          </p>
          <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #e2e8f0;">Método de Pago</label>
          <select id="swal-metodo" class="swal2-input" style="margin-bottom: 12px; width: 100%;">
            <option value="efectivo" ${metodoActual === 'efectivo' ? 'selected' : ''}>Efectivo</option>
            <option value="datafono" ${metodoActual === 'datafono' ? 'selected' : ''}>Datáfono</option>
            <option value="transferencia" ${metodoActual === 'transferencia' ? 'selected' : ''}>Transferencia</option>
          </select>
          <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #e2e8f0;">Servicio (propina)</label>
          <input id="swal-servicio" type="number" class="swal2-input" value="${servicioActual}" min="0" style="margin-bottom: 12px; width: 100%;">
          <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #e2e8f0;">Motivo de la corrección *</label>
          <textarea id="swal-motivo" class="swal2-textarea" placeholder="Ej: Cajero seleccionó método equivocado..." style="width: 100%;"></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Aplicar Corrección',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#06f9f9',
      preConfirm: () => {
        const metodo = (document.getElementById('swal-metodo') as HTMLSelectElement)?.value;
        const servicio = Number((document.getElementById('swal-servicio') as HTMLInputElement)?.value) || 0;
        const motivo = (document.getElementById('swal-motivo') as HTMLTextAreaElement)?.value?.trim();
        if (!motivo || motivo.length < 3) {
          this.alert.showValidationMessage('Debe indicar un motivo (mínimo 3 caracteres)');
          return false;
        }
        const hayCambios = metodo !== metodoActual || servicio !== servicioActual;
        if (!hayCambios) {
          this.alert.showValidationMessage('No hay cambios que aplicar');
          return false;
        }
        return { metodo_pago: metodo !== metodoActual ? metodo : undefined, propina: servicio !== servicioActual ? servicio : undefined, motivo };
      },
    });

    if (result.isConfirmed && result.value) {
      this.platformService.corregirFactura(this.facturaId, result.value).subscribe({
        next: (resp: any) => {
          if (resp.ok) {
            this.alert.success(resp.mensaje || 'Corrección aplicada');
            // Recargar factura
            this.platformService.getFactura(this.facturaId).subscribe(f => {
              this.factura = f;
              if (f.detalles) this.dataSourceFactura.data = f.detalles;
            });
            this.loadCorrecciones();
          } else {
            this.alert.warning(resp.mensaje || 'Sin cambios');
          }
        },
        error: (err) => this.alert.error(err?.error?.message || 'Error al corregir'),
      });
    }
  }

  // ── REIMPRIMIR FACTURA ──
  reimprimirFactura(): void {
    this.platformService.reimprimirFactura(this.facturaId).subscribe({
      next: () => this.alert.success('Factura enviada a imprimir'),
      error: (err) => this.alert.error(err?.error?.message || 'Error al reimprimir'),
    });
  }

  // ── NOTA CRÉDITO (reemplaza anular + reabrir) ──
  emitirNotaCredito(): void {
    if (this.factura.estado !== 'cerrada') return;

    this.platformService.getMesas().subscribe(mesas => {
      const mesasLibres = mesas.filter(m => m.estado === 'libre');

      if (mesasLibres.length === 0) {
        this.alert.warning('No hay mesas libres disponibles para refacturar.');
        return;
      }

      const opciones: Record<string, string> = {};
      mesasLibres.forEach(m => { opciones[m.id] = `Mesa ${m.numero}`; });

      this.alert.fire({
        title: 'Emitir Nota Crédito',
        html: `
          <div style="text-align: left;">
            <p style="color: #94a3b8; font-size: 13px; margin-bottom: 16px;">
              Se anulará <strong>${this.factura.numero_factura}</strong> y se reabrirá con los mismos items
              en la mesa seleccionada. El inventario NO se vuelve a descontar.
            </p>
            <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #e2e8f0;">Mesa destino *</label>
            <select id="swal-mesa-nc" class="swal2-input" style="width: 100%; margin-bottom: 12px;">
              <option value="">Selecciona una mesa...</option>
              ${Object.entries(opciones).map(([id, label]) => `<option value="${id}">${label}</option>`).join('')}
            </select>
            <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #e2e8f0;">Motivo de la Nota Crédito *</label>
            <textarea id="swal-motivo-nc" class="swal2-textarea" placeholder="Ej: Se cobró un item de más, cortesía no aplicada..." style="width: 100%;"></textarea>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Emitir NC',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#f59e0b',
        preConfirm: () => {
          const mesaId = (document.getElementById('swal-mesa-nc') as HTMLSelectElement)?.value;
          const motivo = (document.getElementById('swal-motivo-nc') as HTMLTextAreaElement)?.value?.trim();
          if (!mesaId) { this.alert.showValidationMessage('Selecciona una mesa'); return false; }
          if (!motivo || motivo.length < 3) { this.alert.showValidationMessage('Indica un motivo (mínimo 3 caracteres)'); return false; }
          return { mesa_id: mesaId, motivo };
        },
      }).then(result => {
        if (result.isConfirmed && result.value) {
          this.platformService.emitirNotaCredito(this.facturaId, result.value).subscribe({
            next: (resp: any) => {
              if (resp.ok) {
                this.alert.success(resp.mensaje || 'Nota Crédito emitida');
                // Navegar a la nueva factura si existe
                if (resp.nueva_factura_id) {
                  this.router.navigateByUrl(`/home/facturacion/${resp.nueva_factura_id}`);
                } else {
                  this.router.navigateByUrl('/home/mesas');
                }
              } else {
                this.alert.error(resp.mensaje || 'Error al emitir NC');
              }
            },
            error: (err) => this.alert.error(err?.error?.message || 'Error al emitir Nota Crédito'),
          });
        }
      });
    });
  }
}