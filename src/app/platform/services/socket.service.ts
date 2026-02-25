import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

/**
 * Servicio centralizado de conexión WebSocket via Socket.IO.
 *
 * Se conecta al backend enviando el tenantId como query param,
 * y expone un método `on<T>()` para suscribirse a eventos tipados.
 *
 * Uso:
 *   this.socketService.connect(tenantId);
 *   this.socketService.on<StockAlertPayload>('stock:alerta').subscribe(data => ...);
 */
@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {

    private socket: Socket | null = null;
    private connected = false;

    /**
     * Conecta al servidor WebSocket.
     * Si ya está conectado, no duplica la conexión.
     */
    connect(tenantId: string): void {
        if (this.connected && this.socket?.connected) return;

        this.socket = io(environment.wsUrl, {
            query: { tenantId },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
        });

        this.socket.on('connect', () => {
            this.connected = true;
            console.log('🔌 WebSocket conectado:', this.socket?.id);
        });

        this.socket.on('disconnect', (reason) => {
            this.connected = false;
            console.log('🔌 WebSocket desconectado:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.warn('🔌 WebSocket error:', error.message);
        });
    }

    /**
     * Escucha un evento del servidor y retorna un Observable tipado.
     */
    on<T>(event: string): Observable<T> {
        const subject = new Subject<T>();

        if (this.socket) {
            this.socket.on(event, (data: T) => {
                subject.next(data);
            });
        }

        return subject.asObservable();
    }

    /**
     * Emite un evento al servidor (para futuros usos).
     */
    emit(event: string, data: unknown): void {
        this.socket?.emit(event, data);
    }

    /**
     * Verifica si está conectado.
     */
    get isConnected(): boolean {
        return this.connected && !!this.socket?.connected;
    }

    disconnect(): void {
        this.socket?.disconnect();
        this.socket = null;
        this.connected = false;
    }

    ngOnDestroy(): void {
        this.disconnect();
    }
}
