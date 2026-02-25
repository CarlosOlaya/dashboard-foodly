import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformService } from '../../services/platform.service';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Mesa, TurnoCaja, EstadoMesa } from '../../../shared/interfaces';
import { Subscription } from 'rxjs';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-mesas',
  templateUrl: './mesas.component.html',
  styleUrls: ['./mesas.component.css']
})
export class MesasComponent implements OnInit, OnDestroy {

  mesas: Mesa[] = [];
  mesasFiltradas: Mesa[] = [];
  loading = true;
  comensalesMap: Record<string, number> = {};
  turnoActivo: TurnoCaja | null = null;
  filtroEstado = '';
  private wsSub?: Subscription;

  get usuario() { return this.authService.usuario; }

  constructor(
    private platformService: PlatformService,
    private authService: AuthService,
    private socketService: SocketService,
    private router: Router,
    private alert: AlertService,
  ) { }

  ngOnInit(): void {
    this.verificarTurno();
    this.cargarMesas();

    // WebSocket: escuchar cambios de mesa en tiempo real
    const tenantId = this.authService.usuario.tenant_id;
    this.socketService.connect(tenantId);
    this.wsSub = this.socketService.on<{ id: string; numero: number; estado: EstadoMesa }>('mesa:update')
      .subscribe(data => {
        const mesa = this.mesas.find(m => m.id === data.id || m.numero === data.numero);
        if (mesa) {
          mesa.estado = data.estado;
          if (data.estado === 'libre') {
            this.comensalesMap[mesa.id] = 1;
          }
        } else {
          // Mesa desconocida, re-cargar todas
          this.cargarMesas();
        }
      });
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
  }

  verificarTurno(): void {
    this.platformService.getTurnoActivo().subscribe({
      next: turno => { this.turnoActivo = turno; },
      error: () => { this.turnoActivo = null; }
    });
  }

  cargarMesas(): void {
    this.loading = true;
    this.platformService.getMesas().subscribe({
      next: mesas => {
        this.mesas = mesas;
        this.aplicarFiltro();
        for (const mesa of mesas) {
          if (mesa.estado === 'libre') {
            this.comensalesMap[mesa.id] = 1;
          } else {
            this.cargarComensalesDeMesa(mesa);
          }
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  cargarComensalesDeMesa(mesa: Mesa): void {
    this.platformService.getFacturaActivaMesa(mesa.id).subscribe({
      next: (factura) => {
        if (factura?.num_comensales) {
          this.comensalesMap[mesa.id] = factura.num_comensales;
        } else {
          this.comensalesMap[mesa.id] = 1;
        }
      },
      error: () => { this.comensalesMap[mesa.id] = 1; }
    });
  }

  onComensalesChange(mesa: Mesa, event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = parseInt(input.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 99) val = 99;
    input.value = String(val);
    this.comensalesMap[mesa.id] = val;
  }

  guardarComensales(mesa: Mesa): void {
    const val = this.comensalesMap[mesa.id];
    if (!val) return;
    this.platformService.actualizarComensales(mesa.id, val).subscribe();
  }

  async abrirMesa(mesa: Mesa): Promise<void> {
    if (!this.turnoActivo) {
      const result = await this.alert.fire({
        icon: 'warning',
        title: 'Sin turno abierto',
        html: 'Debes <b>abrir un turno de caja</b> antes de poder usar las mesas.',
        confirmButtonText: 'Ir a Arqueo',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
      });
      if (result.isConfirmed) this.router.navigateByUrl('/home/arqueo');
      return;
    }

    if (mesa.estado === 'libre') {
      const comensales = this.comensalesMap[mesa.id] || 1;
      this.platformService.abrirMesa(mesa.id, this.usuario.uid, comensales).subscribe({
        next: () => {
          this.router.navigateByUrl(`/home/servicio_mesa/${mesa.id}`);
        },
        error: (err) => {
          this.alert.error(err?.error?.message || 'Error al abrir la mesa');
        }
      });
    }
  }

  irAServicio(mesa: Mesa): void {
    if (mesa.estado === 'ocupada' || mesa.estado === 'impresa') {
      this.router.navigateByUrl(`/home/servicio_mesa/${mesa.id}`);
    }
  }

  irAAbrirTurno(): void {
    this.router.navigateByUrl('/home/arqueo');
  }

  get mesasLibres(): number { return this.mesas.filter(m => m.estado === 'libre').length; }
  get mesasOcupadas(): number { return this.mesas.filter(m => m.estado !== 'libre').length; }

  aplicarFiltro(): void {
    if (!this.filtroEstado) {
      this.mesasFiltradas = [...this.mesas];
    } else {
      this.mesasFiltradas = this.mesas.filter(m => m.estado === this.filtroEstado);
    }
  }
}
