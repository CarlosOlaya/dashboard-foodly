import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlatformService } from '../../services/platform.service';
import { CHART_COLORS } from '../../../shared/chart-colors';

@Component({
    selector: 'app-monitor',
    templateUrl: './monitor.component.html',
    styleUrls: ['./monitor.component.css'],
})
export class MonitorComponent implements OnInit, OnDestroy {

    loading = true;
    data: any = null;
    turnoActivo = false;
    turnoCerrado = false;

    // Select turno
    turnoSeleccionado = 'actual';
    historial: any[] = [];

    // PLU
    showAllPlu = false;
    pluDisplayLimit = 10;

    // Charts
    chartMetodos: any[] = [];
    chartPropinas: any[] = [];
    chartProductos: any[] = [];
    pieColors: any = CHART_COLORS.pie;
    barColors: any = CHART_COLORS.bar;

    Math = Math;

    // Timer
    tiempoActivo = '';
    private timerRef: ReturnType<typeof setInterval> | null = null;
    private refreshRef: ReturnType<typeof setInterval> | null = null;

    constructor(private platform: PlatformService) { }

    ngOnInit(): void {
        this.cargar();
    }

    ngOnDestroy(): void {
        if (this.timerRef) clearInterval(this.timerRef);
        if (this.refreshRef) clearInterval(this.refreshRef);
    }

    cargar(): void {
        this.loading = true;
        if (this.turnoSeleccionado === 'actual') {
            this.platform.getMonitorData().subscribe({
                next: d => this.procesar(d),
                error: () => { this.loading = false; },
            });
        } else {
            this.platform.getMonitorTurno(this.turnoSeleccionado).subscribe({
                next: d => this.procesar(d),
                error: () => { this.loading = false; },
            });
        }
    }

    private procesar(d: any): void {
        this.data = d;
        this.turnoActivo = d.turno_activo || false;
        this.turnoCerrado = d.turno_cerrado || false;
        if (d.historial) this.historial = d.historial;
        if (this.turnoActivo || this.turnoCerrado) this.buildCharts();
        if (this.turnoActivo) {
            this.iniciarTimer();
            this.iniciarAutoRefresh();
        }
        this.loading = false;
    }

    onTurnoChange(): void {
        if (this.timerRef) clearInterval(this.timerRef);
        if (this.refreshRef) clearInterval(this.refreshRef);
        this.cargar();
    }

    private buildCharts(): void {
        const mp = this.data?.metodos_pago || {};
        this.chartMetodos = [
            { name: 'Efectivo', value: mp.efectivo || 0 },
            { name: 'Datáfono', value: mp.datafono || 0 },
            { name: 'Transferencia', value: mp.transferencia || 0 },
            { name: 'Crédito', value: mp.credito || 0 },
        ].filter(i => i.value > 0);

        const pr = this.data?.propinas || {};
        this.chartPropinas = [
            { name: 'Efectivo', value: pr.efectivo || 0 },
            { name: 'Datáfono', value: pr.datafono || 0 },
            { name: 'Transferencia', value: pr.transferencia || 0 },
        ].filter(i => i.value > 0);

        const productos = this.data?.productos || [];
        this.chartProductos = productos.slice(0, 10).map((p: any) => ({
            name: p.nombre.length > 18 ? p.nombre.slice(0, 18) + '…' : p.nombre,
            value: p.cantidad || 0,
        }));
    }

    private iniciarTimer(): void {
        if (this.timerRef) clearInterval(this.timerRef);
        this.actualizarTiempo();
        this.timerRef = setInterval(() => this.actualizarTiempo(), 60000);
    }

    private iniciarAutoRefresh(): void {
        if (this.refreshRef) clearInterval(this.refreshRef);
        this.refreshRef = setInterval(() => {
            if (this.turnoActivo && this.turnoSeleccionado === 'actual') {
                this.platform.getMonitorData().subscribe({
                    next: d => {
                        this.data = d;
                        this.turnoActivo = d.turno_activo || false;
                        if (d.historial) this.historial = d.historial;
                        if (this.turnoActivo) this.buildCharts();
                    }
                });
            }
        }, 30000);
    }

    private actualizarTiempo(): void {
        if (!this.data?.turno?.hora_apertura) return;
        const apertura = new Date(this.data.turno.hora_apertura);
        const ahora = new Date();
        const diff = ahora.getTime() - apertura.getTime();
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        this.tiempoActivo = `${h}h ${m}m`;
    }

    get pluItems(): any[] {
        const productos = this.data?.productos || [];
        return this.showAllPlu ? productos : productos.slice(0, this.pluDisplayLimit);
    }

    get pluTotal(): number {
        return (this.data?.productos || []).reduce((s: number, p: any) => s + (p.cantidad || 0), 0);
    }

    get pluTotalValor(): number {
        return (this.data?.productos || []).reduce((s: number, p: any) => s + (p.valor || 0), 0);
    }

    // ── Formatters ──
    fmt(val: number): string {
        return (val || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 });
    }

    axisFormat = (val: number) => {
        if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
        if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
        return `$${val}`;
    };

    refrescar(): void { this.cargar(); }
}
