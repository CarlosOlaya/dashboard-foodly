import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlatformService } from '../../services/platform.service';
import { AuthService } from '../../../auth/services/auth.service';
import { PdfService } from '../../services/pdf.service';
import { TurnoCaja } from '../../../auth/interfaces/interfaces';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-arqueo',
  templateUrl: './arqueo.component.html',
  styleUrls: ['./arqueo.component.css']
})
export class ArqueoComponent implements OnInit, OnDestroy {

  turnoActivo: TurnoCaja | null = null;
  resumen: any = null;
  historial: TurnoCaja[] = [];
  loading = true;

  // Abrir turno
  abriendoTurno = false;

  // Cerrar turno
  cerrandoTurno = false;

  // Detalle
  turnoDetalle: TurnoCaja | null = null;
  showDetalle = false;

  // Vista
  vistaActual: 'activo' | 'historial' = 'activo';

  // Timer
  tiempoActivo = '0h 0m';
  private timerRef: any;
  private refreshRef: any;

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  get usuario() { return this.authService.usuario; }

  constructor(
    private platformService: PlatformService,
    private authService: AuthService,
    private pdfService: PdfService,
    private alert: AlertService,
  ) { }

  ngOnInit(): void {
    this.cargar();
  }

  ngOnDestroy(): void {
    if (this.timerRef) clearInterval(this.timerRef);
    if (this.refreshRef) clearInterval(this.refreshRef);
  }

  cargar(): void {
    this.loading = true;
    this.cargarResumenEnVivo();

    this.platformService.getHistorialTurnos().subscribe({
      next: turnos => { this.historial = turnos; }
    });
  }

  cargarResumenEnVivo(): void {
    this.platformService.getResumenTurnoEnVivo().subscribe({
      next: data => {
        if (data) {
          this.turnoActivo = data.turno;
          this.resumen = data;
          this.iniciarTimer();
          this.iniciarAutoRefresh();
        } else {
          this.turnoActivo = null;
          this.resumen = null;
        }
        this.loading = false;
      },
      error: () => {
        this.turnoActivo = null;
        this.resumen = null;
        this.loading = false;
      }
    });
  }

  private iniciarTimer(): void {
    if (this.timerRef) clearInterval(this.timerRef);
    this.actualizarTiempo();
    this.timerRef = setInterval(() => this.actualizarTiempo(), 60000);
  }

  private iniciarAutoRefresh(): void {
    if (this.refreshRef) clearInterval(this.refreshRef);
    // Auto-refresh cada 30 segundos
    this.refreshRef = setInterval(() => {
      if (this.turnoActivo) {
        this.platformService.getResumenTurnoEnVivo().subscribe({
          next: data => {
            if (data) {
              this.resumen = data;
              this.turnoActivo = data.turno;
            }
          }
        });
      }
    }, 30000);
  }

  private actualizarTiempo(): void {
    if (!this.turnoActivo) return;
    const apertura = new Date(this.turnoActivo.hora_apertura);
    const ahora = new Date();
    const diff = ahora.getTime() - apertura.getTime();
    const horas = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    this.tiempoActivo = `${horas}h ${mins}m`;
  }

  // ══════════════════════════════════════════════
  // ABRIR TURNO
  // ══════════════════════════════════════════════
  abrirTurno(): void {
    if (this.abriendoTurno) return;

    this.alert.fire({
      title: 'Abrir Turno de Caja',
      html: `
        <p style="margin-bottom: 16px; color: #64748b;">Ingresa el efectivo inicial en caja</p>
        <input id="swal-efectivo" type="number" class="swal2-input" placeholder="Efectivo inicial" value="0" min="0" step="1000">
      `,
      showCancelButton: true,
      confirmButtonText: 'Abrir turno',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const input = document.getElementById('swal-efectivo') as HTMLInputElement;
        return Number(input.value) || 0;
      }
    }).then(result => {
      if (result.isConfirmed) {
        this.abriendoTurno = true;
        this.platformService.abrirTurno(result.value).subscribe({
          next: resp => {
            this.abriendoTurno = false;
            if (resp.ok) {
              this.alert.success('Turno abierto exitosamente');
              this.cargar();
            }
          },
          error: err => {
            this.abriendoTurno = false;
            this.alert.error(err?.error?.message || 'Error al abrir turno');
          }
        });
      }
    });
  }

  // ══════════════════════════════════════════════
  // CERRAR TURNO
  // ══════════════════════════════════════════════
  cerrarTurno(): void {
    if (!this.turnoActivo || this.cerrandoTurno) return;

    // Verificar que todas las mesas estén libres
    this.platformService.getMesas().subscribe({
      next: mesas => {
        const ocupadas = mesas.filter(m => m.estado !== 'libre');
        if (ocupadas.length > 0) {
          this.alert.fire({
            icon: 'warning',
            title: 'Mesas ocupadas',
            html: `No puedes cerrar el turno. Hay <b>${ocupadas.length} mesa(s)</b> aún ocupada(s).<br><small>Cierra o cobra todas las mesas antes de hacer el cierre.</small>`,
            confirmButtonText: 'Entendido',
          });
          return;
        }
        this.mostrarDialogCerrarTurno();
      }
    });
  }

  private mostrarDialogCerrarTurno(): void {
    const esperado = this.resumen?.efectivo_esperado || 0;
    const r = this.resumen;

    this.alert.fire({
      title: 'Cerrar Turno de Caja',
      html: `
        <div style="text-align: left; margin-bottom: 16px; padding: 10px; background: rgba(8,145,178,0.06); border:1px solid rgba(8,145,178,0.12); border-radius: 8px; font-size: 13px; color:#334155;">
          <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:#0891B2; margin-bottom:6px;">💵 Efectivo esperado en caja</div>
          <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>Inicial</span><span>$${this.formatMoney(this.turnoActivo?.efectivo_inicial)}</span></div>
          <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>+ Venta</span><span>$${this.formatMoney(r?.total_efectivo)}</span></div>
          <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>+ Propina</span><span>$${this.formatMoney(r?.propina_efectivo)}</span></div>
          <div style="display:flex; justify-content:space-between; padding:6px 0 0; border-top:1px solid rgba(8,145,178,0.15); margin-top:4px;">
            <b>= Esperado</b><b style="color:#0891B2; font-size:15px;">$${this.formatMoney(esperado)}</b>
          </div>
        </div>
        <div style="margin-bottom: 12px;">
          <label style="display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 4px;">Efectivo contado</label>
          <input id="swal-contado" type="number" class="swal2-input" placeholder="Efectivo contado" min="0" step="1000" style="margin:0; width:100%;">
        </div>
        <div>
          <label style="display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 4px;">Observaciones (opcional)</label>
          <textarea id="swal-obs" class="swal2-textarea" placeholder="Observaciones..." style="margin:0; width:100%; min-height: 60px;"></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Cerrar turno',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const contado = Number((document.getElementById('swal-contado') as HTMLInputElement).value) || 0;
        const obs = (document.getElementById('swal-obs') as HTMLTextAreaElement).value;
        return { contado, obs };
      }
    }).then(result => {
      if (result.isConfirmed) {
        this.cerrandoTurno = true;
        this.platformService.cerrarTurno(
          this.turnoActivo!.id,
          result.value.contado,
          result.value.obs || undefined
        ).subscribe({
          next: (resp: any) => {
            this.cerrandoTurno = false;
            if (resp.ok) {
              const r = resp.resumen;
              const difColor = r.diferencia >= 0 ? '#10b981' : '#ef4444';
              const difLabel = r.diferencia > 0 ? 'Sobrante' : r.diferencia < 0 ? 'Faltante' : 'Cuadrado';
              this.alert.fire({
                title: '🧲 Cierre de Turno',
                width: 520,
                html: `
                  <div style="text-align:left; font-size:13px; line-height:1.6; color:#334155;">
                    <!-- Resumen general -->
                    <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e2e8f0;">
                      <span>Total ventas</span>
                      <b>$${this.formatMoney(r.total_ventas)}</b>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e2e8f0;">
                      <span>Facturas: ${r.num_facturas} &nbsp;|&nbsp; Anulaciones: ${r.num_anulaciones}</span>
                      <span>Propinas: <b>$${this.formatMoney(r.total_propinas)}</b></span>
                    </div>

                    <!-- Efectivo -->
                    <div style="margin-top:12px; padding:10px; background:rgba(8,145,178,0.06); border:1px solid rgba(8,145,178,0.12); border-radius:8px;">
                      <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:#0891B2; margin-bottom:6px;">💵 Efectivo en caja</div>
                      <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>Efectivo inicial</span><span>$${this.formatMoney(r.efectivo_inicial)}</span></div>
                      <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>+ Venta</span><span>$${this.formatMoney(r.total_efectivo)}</span></div>
                      <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>+ Propina</span><span>$${this.formatMoney(r.propina_efectivo)}</span></div>
                      <div style="display:flex; justify-content:space-between; padding:6px 0 2px; border-top:1px solid rgba(8,145,178,0.15); margin-top:4px;">
                        <b>= Esperado</b><b style="color:#0891B2;">$${this.formatMoney(r.efectivo_esperado)}</b>
                      </div>
                      <div style="display:flex; justify-content:space-between; padding:2px 0;"><b>Contado</b><b>$${this.formatMoney(r.efectivo_contado)}</b></div>
                      <div style="display:flex; justify-content:space-between; padding:6px 0 0; border-top:1px solid rgba(8,145,178,0.15); margin-top:4px;">
                        <b style="color:${difColor};">${difLabel}</b><b style="font-size:15px; color:${difColor};">$${this.formatMoney(Math.abs(r.diferencia))}</b>
                      </div>
                    </div>

                    <!-- Tarjetas -->
                    <div style="margin-top:8px; padding:10px; background:rgba(59,130,246,0.06); border:1px solid rgba(59,130,246,0.12); border-radius:8px;">
                      <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:#3b82f6; margin-bottom:6px;">💳 Tarjetas / Datáfono</div>
                      <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>Venta</span><span>$${this.formatMoney(r.total_datafono)}</span></div>
                      <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>Propina</span><span>$${this.formatMoney(r.propina_datafono)}</span></div>
                      <div style="display:flex; justify-content:space-between; padding:4px 0 0; border-top:1px solid rgba(59,130,246,0.15); margin-top:4px;">
                        <b>Total</b><b style="color:#3b82f6;">$${this.formatMoney(r.total_datafono + r.propina_datafono)}</b>
                      </div>
                    </div>

                    <!-- Transferencias -->
                    <div style="margin-top:8px; padding:10px; background:rgba(139,92,246,0.06); border:1px solid rgba(139,92,246,0.12); border-radius:8px;">
                      <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:#8b5cf6; margin-bottom:6px;">🏦 Transferencias</div>
                      <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>Venta</span><span>$${this.formatMoney(r.total_transferencia)}</span></div>
                      <div style="display:flex; justify-content:space-between; padding:2px 0;"><span>Propina</span><span>$${this.formatMoney(r.propina_transferencia)}</span></div>
                      <div style="display:flex; justify-content:space-between; padding:4px 0 0; border-top:1px solid rgba(139,92,246,0.15); margin-top:4px;">
                        <b>Total</b><b style="color:#8b5cf6;">$${this.formatMoney(r.total_transferencia + r.propina_transferencia)}</b>
                      </div>
                    </div>

                    <!-- Descuentos -->
                    ${r.total_descuentos > 0 ? `
                    <div style="display:flex; justify-content:space-between; padding:8px 0; margin-top:8px; color:#94a3b8; font-size:12px;">
                      <span>Descuentos aplicados</span><span>-$${this.formatMoney(r.total_descuentos)}</span>
                    </div>` : ''}
                  </div>
                `,
                icon: r.diferencia === 0 ? 'success' : 'info',
                confirmButtonText: 'Entendido',
              });
              // ── Imprimir tickets de cierre ──
              const turnoId = this.turnoActivo!.id;
              this.pdfService.imprimirCierreTurno(turnoId)
                .catch((err: any) => console.error('Error al imprimir cierre:', err));
              setTimeout(() => {
                this.pdfService.imprimirFacturasTurno(turnoId)
                  .catch((err: any) => console.error('Error al imprimir facturas:', err));
              }, 800);
              this.turnoActivo = null;
              this.resumen = null;
              if (this.timerRef) clearInterval(this.timerRef);
              if (this.refreshRef) clearInterval(this.refreshRef);
              this.cargar();
            }
          },
          error: err => {
            this.cerrandoTurno = false;
            this.alert.error(err?.error?.message || 'Error al cerrar turno');
          }
        });
      }
    });
  }

  refrescar(): void {
    this.cargarResumenEnVivo();
  }

  // ══════════════════════════════════════════════
  // DETALLE
  // ══════════════════════════════════════════════
  verDetalle(turno: TurnoCaja): void {
    this.turnoDetalle = turno;
    this.showDetalle = true;
  }

  cerrarDetalle(): void {
    this.showDetalle = false;
    this.turnoDetalle = null;
  }

  // ══════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════
  formatMoney(val: number | undefined): string {
    return (Number(val) || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 });
  }

  getEstadoClass(turno: TurnoCaja): string {
    return turno.estado === 'abierto' ? 'estado-abierto' : 'estado-cerrado';
  }

  getDiferenciaClass(turno: TurnoCaja): string {
    const diff = Number(turno.diferencia) || 0;
    if (diff === 0) return 'dif-ok';
    return diff > 0 ? 'dif-sobrante' : 'dif-faltante';
  }

  getDiferenciaLabel(turno: TurnoCaja): string {
    const diff = Number(turno.diferencia) || 0;
    if (diff === 0) return 'Cuadra';
    return diff > 0 ? 'Sobrante' : 'Faltante';
  }

  getMetodoIcon(metodo: string): string {
    switch (metodo?.toLowerCase()) {
      case 'efectivo': return 'payments';
      case 'datafono': case 'tarjeta': return 'credit_card';
      case 'transferencia': return 'account_balance';
      case 'credito': return 'schedule';
      default: return 'payment';
    }
  }
}
