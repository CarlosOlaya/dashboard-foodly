import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlatformService } from '../../services/platform.service';
import { PdfService } from '../../services/pdf.service';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Comanda } from '../../../shared/interfaces';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface AreaOption {
    codigo: string;
    nombre: string;
    icono: string;
}

@Component({
    selector: 'app-comandas',
    templateUrl: './comandas.component.html',
    styleUrls: ['./comandas.component.css']
})
export class ComandasComponent implements OnInit, OnDestroy {

    // ══════════════════════════════════════════════════════
    // Vista actual: 'pendientes' | 'completadas'
    // ══════════════════════════════════════════════════════
    vistaActual: 'pendientes' | 'completadas' = 'pendientes';

    // Datos separados por vista
    comandasPendientes: Comanda[] = [];
    comandasCompletadas: Comanda[] = [];

    filtroArea = '';
    loading = true;
    areasConfig: AreaOption[] = [];
    private intervalo: ReturnType<typeof setInterval> | null = null;
    private audioCtx: AudioContext | null = null;
    private prevIds = new Set<string>();
    private wsSubs: Subscription[] = [];

    constructor(
        private platformService: PlatformService,
        private pdfService: PdfService,
        private socketService: SocketService,
        private authService: AuthService,
        private http: HttpClient,
    ) { }

    ngOnInit(): void {
        this.loadAreas();
        this.cargar();

        // WebSocket: escuchar nuevas comandas en tiempo real
        const tenantId = this.authService.usuario.tenant_id;
        this.socketService.connect(tenantId);

        this.wsSubs.push(
            this.socketService.on<Comanda>('comanda:nueva').subscribe(data => {
                // Agregar la nueva comanda a la lista de pendientes
                if (!this.comandasPendientes.find(c => c.id === data.id)) {
                    this.comandasPendientes = [data, ...this.comandasPendientes];
                    this.playAlert();
                }
            }),
            this.socketService.on<Comanda>('comanda:update').subscribe(data => {
                if (data.estado === 'entregada' || data.estado === 'lista') {
                    // Mover de pendientes a completadas
                    const comanda = this.comandasPendientes.find(c => c.id === data.id);
                    if (comanda) {
                        comanda.estado = data.estado;
                        this.comandasPendientes = this.comandasPendientes.filter(c => c.id !== data.id);
                        this.comandasCompletadas = [comanda, ...this.comandasCompletadas];
                    }
                } else {
                    // Actualizar estado in-place (ej: 'impresa')
                    const comanda = this.comandasPendientes.find(c => c.id === data.id);
                    if (comanda) comanda.estado = data.estado;
                }
            }),
        );

        // Fallback: refrescar cada 30s por si se pierde la conexión WebSocket
        this.intervalo = setInterval(() => this.cargar(true), 30000);
    }

    ngOnDestroy(): void {
        if (this.intervalo) clearInterval(this.intervalo);
        this.wsSubs.forEach(s => s.unsubscribe());
    }

    cambiarVista(vista: 'pendientes' | 'completadas'): void {
        this.vistaActual = vista;
        this.cargar();
    }

    cargar(silent = false): void {
        if (!silent) this.loading = true;

        if (this.vistaActual === 'pendientes') {
            this.platformService.getComandasActivas(this.filtroArea || undefined).subscribe({
                next: (data) => {
                    // Detectar nuevas comandas para sonido
                    const newIds = new Set(data.map(c => c.id));
                    const hayNuevas = data.some(c => !this.prevIds.has(c.id));
                    if (hayNuevas && this.prevIds.size > 0) {
                        this.playAlert();
                    }
                    this.prevIds = newIds;
                    this.comandasPendientes = data;
                    this.loading = false;
                },
                error: () => { this.loading = false; }
            });
        } else {
            // Cargar historial de hoy y filtrar solo las completadas
            this.platformService.getComandasHoy().subscribe({
                next: (data) => {
                    this.comandasCompletadas = data.filter(
                        c => c.estado === 'lista' || c.estado === 'entregada'
                    );
                    this.loading = false;
                },
                error: () => { this.loading = false; }
            });
        }
    }

    private loadAreas(): void {
        this.http.get<AreaOption[]>(`${environment.baseUrl}/auth/areas`)
            .subscribe({
                next: (areas) => { this.areasConfig = areas; },
                error: () => {
                    this.areasConfig = [
                        { codigo: 'cocina', nombre: 'Cocina', icono: 'soup_kitchen' },
                        { codigo: 'bar', nombre: 'Bar', icono: 'local_bar' },
                    ];
                }
            });
    }

    cambiarArea(area: string): void {
        this.filtroArea = area;
        this.cargar();
    }

    esAnulacion(c: Comanda): boolean {
        const p = c.payload as { tipo_comanda?: string } | null;
        return p?.tipo_comanda === 'anulacion';
    }

    get comandasVisibles(): Comanda[] {
        const lista = this.vistaActual === 'pendientes'
            ? this.comandasPendientes
            : this.comandasCompletadas;
        if (!this.filtroArea) return lista;
        return lista.filter(c => c.area_destino === this.filtroArea);
    }

    getMinutos(created: string): number {
        return Math.floor((Date.now() - new Date(created).getTime()) / 60000);
    }

    getTimerLabel(created: string): string {
        const min = this.getMinutos(created);
        if (min < 1) return 'Ahora';
        if (min < 60) return `${min} min`;
        const h = Math.floor(min / 60);
        const m = min % 60;
        return `${h}h ${m}m`;
    }

    getTimerClass(created: string): string {
        const min = this.getMinutos(created);
        if (min < 10) return 'timer-green';
        if (min < 20) return 'timer-yellow';
        return 'timer-red';
    }

    getHora(fecha: string): string {
        return new Date(fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    }

    getEstadoLabel(estado: string): string {
        switch (estado) {
            case 'lista': return 'Lista';
            case 'entregada': return 'Entregada';
            default: return estado;
        }
    }

    getEstadoClass(estado: string): string {
        switch (estado) {
            case 'lista': return 'estado-lista';
            case 'entregada': return 'estado-entregada';
            default: return '';
        }
    }

    /**
     * Acción unificada para completar una comanda.
     * La marca como entregada en el sistema y la mueve a la vista de completadas.
     */
    marcarEntregada(comanda: Comanda): void {
        this.platformService.marcarComandaEntregada(comanda.id).subscribe({
            next: () => {
                // Remover de la lista de pendientes inmediatamente
                this.comandasPendientes = this.comandasPendientes.filter(c => c.id !== comanda.id);
                this.prevIds.delete(comanda.id);

                // Si ya teníamos cargadas algunas completadas, podemos añadirla localmente
                // para que esté lista si el usuario cambia de pestaña.
                comanda.estado = 'entregada';
                this.comandasCompletadas = [comanda, ...this.comandasCompletadas];
            },
            error: (err) => {
                console.error('Error al completar comanda:', err);
            }
        });
    }

    imprimirComanda(comandaId: string, event: Event): void {
        event.stopPropagation();
        this.pdfService.imprimirComanda(comandaId)
            .catch(err => console.error('Error al abrir comanda:', err));
    }

    private playAlert(): void {
        try {
            if (!this.audioCtx) this.audioCtx = new AudioContext();
            const ctx = this.audioCtx;
            [0, 0.25].forEach(delay => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 880;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
                osc.start(ctx.currentTime + delay);
                osc.stop(ctx.currentTime + delay + 0.3);
            });
        } catch (e) {
            console.warn('No se pudo reproducir sonido:', e);
        }
    }

    get areasDisponibles(): string[] {
        return [...new Set(this.comandasPendientes.map(c => c.area_destino))].sort();
    }

    get contadorPendientes(): number {
        return this.comandasPendientes.filter(c => c.estado === 'pendiente').length;
    }

    get contadorEnPreparacion(): number {
        return this.comandasPendientes.filter(c => c.estado === 'impresa').length;
    }

    get contadorCompletadas(): number {
        return this.comandasCompletadas.length;
    }
}
