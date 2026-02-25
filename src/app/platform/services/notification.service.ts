import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { PlatformService } from './platform.service';
import { SocketService } from './socket.service';
import { Producto } from '../../shared/interfaces';

export interface StockAlertPayload {
    producto_id: string;
    nombre: string;
    stock: number;
    stock_minimo: number;
    tipo_stock: string;
    tipo: 'stock_bajo' | 'agotado';
}

export interface StockNotification {
    id: string;
    producto_id: string;
    nombre: string;
    stock: number;
    tipo_stock: string;
    tipo: 'stock_bajo' | 'agotado';
    mensaje: string;
    timestamp: Date;
    leido: boolean;
}

/**
 * Servicio de notificaciones en tiempo real para alertas de inventario.
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  1. Carga inicial: GET /inventario/stock-bajo           │
 * │     → Rellena la lista de notificaciones existentes     │
 * │     → Marcadas como leídas (silenciosas)                │
 * │                                                         │
 * │  2. WebSocket: escucha 'stock:alerta'                   │
 * │     → Nuevas alertas en TIEMPO REAL                     │
 * │     → Genera toast + marca como no leída                │
 * └─────────────────────────────────────────────────────────┘
 */
@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {

    private socketSub?: Subscription;

    /** Lista completa de notificaciones (más recientes primero) */
    private notificationsSubject = new BehaviorSubject<StockNotification[]>([]);
    notifications$ = this.notificationsSubject.asObservable();

    /** Conteo de no leídas */
    private unreadCountSubject = new BehaviorSubject<number>(0);
    unreadCount$ = this.unreadCountSubject.asObservable();

    /** Emite cuando hay una notificación nueva (para toasts) */
    private newAlertSubject = new Subject<StockNotification>();
    newAlert$ = this.newAlertSubject.asObservable();

    constructor(
        private platformService: PlatformService,
        private socketService: SocketService,
    ) { }

    /**
     * Inicia el sistema de notificaciones:
     * 1. Carga alertas existentes via HTTP
     * 2. Se suscribe a WebSocket para alertas nuevas
     */
    start(tenantId: string): void {
        // Cargar alertas existentes (silenciosas)
        this.loadExistingAlerts();

        // Conectar WebSocket y escuchar stock:alerta
        this.socketService.connect(tenantId);
        this.socketSub = this.socketService
            .on<StockAlertPayload>('stock:alerta')
            .subscribe(payload => this.handleNewAlert(payload));
    }

    stop(): void {
        this.socketSub?.unsubscribe();
        this.socketSub = undefined;
    }

    private loadExistingAlerts(): void {
        this.platformService.getStockBajo().subscribe({
            next: (productos) => {
                const initialNotifs: StockNotification[] = productos.map(p => ({
                    id: `stock-${p.id}-init`,
                    producto_id: p.id,
                    nombre: p.nombre,
                    stock: Number(p.stock),
                    tipo_stock: p.tipo_stock || 'und',
                    tipo: Number(p.stock) <= 0 ? 'agotado' : 'stock_bajo',
                    mensaje: Number(p.stock) <= 0
                        ? `${p.nombre} está AGOTADO`
                        : `${p.nombre} tiene stock bajo (${p.stock} ${p.tipo_stock || 'und'})`,
                    timestamp: new Date(),
                    leido: true, // Silenciosas — ya existían
                }));
                this.notificationsSubject.next(initialNotifs);
                // No recalc unread, todas están leídas
            },
        });
    }

    private handleNewAlert(payload: StockAlertPayload): void {
        const notif: StockNotification = {
            id: `stock-${payload.producto_id}-${Date.now()}`,
            producto_id: payload.producto_id,
            nombre: payload.nombre,
            stock: payload.stock,
            tipo_stock: payload.tipo_stock,
            tipo: payload.tipo,
            mensaje: payload.tipo === 'agotado'
                ? `¡${payload.nombre} se ha AGOTADO!`
                : `${payload.nombre} llegó a stock mínimo (${payload.stock} ${payload.tipo_stock})`,
            timestamp: new Date(),
            leido: false,
        };

        const current = this.notificationsSubject.value;
        current.unshift(notif);
        this.notificationsSubject.next([...current]);
        this.recalcUnread();

        // Emitir para toast
        this.newAlertSubject.next(notif);
    }

    markAsRead(notifId: string): void {
        const notifs = this.notificationsSubject.value;
        const notif = notifs.find(n => n.id === notifId);
        if (notif) {
            notif.leido = true;
            this.notificationsSubject.next([...notifs]);
            this.recalcUnread();
        }
    }

    markAllAsRead(): void {
        const notifs = this.notificationsSubject.value;
        notifs.forEach(n => n.leido = true);
        this.notificationsSubject.next([...notifs]);
        this.recalcUnread();
    }

    clearAll(): void {
        this.notificationsSubject.next([]);
        this.recalcUnread();
    }

    private recalcUnread(): void {
        const count = this.notificationsSubject.value.filter(n => !n.leido).length;
        this.unreadCountSubject.next(count);
    }

    ngOnDestroy(): void {
        this.stop();
    }
}
