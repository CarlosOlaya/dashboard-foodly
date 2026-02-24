import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { PlatformService } from '../../../services/platform.service';
import { PdfService } from '../../../services/pdf.service';
import { PedidoItem } from '../../../../auth/interfaces/interfaces';
import { AlertService } from '../../../services/alert.service';

@Component({
    selector: 'app-cobro-panel',
    templateUrl: './cobro-panel.component.html',
    styleUrls: ['./cobro-panel.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class CobroPanelComponent {

    Math = Math;

    // ── Inputs del padre ─────────────────────────────────
    @Input() itemsFactura: PedidoItem[] = [];
    @Input() facturaId = '';
    @Input() mesaNumero = 0;
    @Input() totalDescuentosItems = 0;
    @Input() facturaDescuento = 0;

    // ── Outputs al padre ─────────────────────────────────
    @Output() cerrado = new EventEmitter<void>();
    @Output() cobroExitoso = new EventEmitter<string>(); // emite facturaId

    // ── Estado interno ───────────────────────────────────
    servicioActivo = true;
    servicioPct = 10;
    servicioModo: 'porcentaje' | 'valor' = 'porcentaje';
    servicioValor = 0;
    metodoPago = 'efectivo';
    pagoDividido = false;
    pagos: Array<{ metodo: string; monto: number; propina: number; ref: string }> = [];
    procesando = false;

    constructor(
        private platformService: PlatformService,
        private pdfService: PdfService,
        private alert: AlertService,
    ) { }

    // ── Cálculos ─────────────────────────────────────────

    get bruto(): number {
        return this.itemsFactura.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
    }

    get subtotal(): number {
        return Math.max(0, this.bruto - this.totalDescuentosItems - this.facturaDescuento);
    }

    get servicioMonto(): number {
        if (!this.servicioActivo) return 0;
        if (this.servicioModo === 'porcentaje') {
            return Math.round(this.subtotal * this.servicioPct / 100);
        }
        return this.servicioValor;
    }

    get total(): number {
        return this.subtotal + this.servicioMonto;
    }

    // ── Acciones de servicio ─────────────────────────────

    toggleServicio(): void {
        this.servicioActivo = !this.servicioActivo;
    }

    setServicioPct(pct: number): void {
        this.servicioPct = pct;
        this.servicioModo = 'porcentaje';
    }

    setServicioModo(modo: 'porcentaje' | 'valor'): void {
        this.servicioModo = modo;
        if (modo === 'valor') {
            this.servicioValor = this.servicioMonto;
        }
    }

    // ── Pago dividido ────────────────────────────────────

    togglePagoDividido(): void {
        this.pagoDividido = !this.pagoDividido;
        if (this.pagoDividido) {
            this.pagos = [
                { metodo: 'efectivo', monto: 0, propina: 0, ref: '' },
                { metodo: 'tarjeta', monto: 0, propina: 0, ref: '' },
            ];
        } else {
            this.pagos = [{ metodo: this.metodoPago, monto: this.total, propina: 0, ref: '' }];
        }
    }

    agregarPago(): void {
        this.pagos.push({ metodo: 'efectivo', monto: 0, propina: 0, ref: '' });
    }

    quitarPago(i: number): void {
        if (this.pagos.length > 2) {
            this.pagos.splice(i, 1);
        }
    }

    get sumaPagos(): number {
        return this.pagos.reduce((s, p) => s + (Number(p.monto) || 0), 0);
    }

    get diferenciaPagos(): number {
        return this.total - this.sumaPagos;
    }

    get sumaPropinas(): number {
        return this.pagos.reduce((s, p) => s + (Number(p.propina) || 0), 0);
    }

    get diferenciaPropinas(): number {
        return this.servicioMonto - this.sumaPropinas;
    }

    /** Asigna toda la propina restante al pago actual */
    asignarPropinaRestante(i: number): void {
        const restante = this.servicioMonto - this.pagos.reduce((s, p, idx) => {
            return s + (idx === i ? 0 : (Number(p.propina) || 0));
        }, 0);
        this.pagos[i].propina = Math.max(0, restante);
    }

    // ── Confirmar cobro ──────────────────────────────────

    confirmarCobro(): void {
        if (this.procesando) return;
        const propina = this.servicioMonto;

        if (this.pagoDividido) {
            if (Math.abs(this.diferenciaPagos) > 1) {
                this.alert.warning(`Montos no cuadran. Diferencia: $${this.diferenciaPagos.toLocaleString()}`);
                return;
            }
            if (propina > 0 && Math.abs(this.diferenciaPropinas) > 1) {
                this.alert.warning(`Propinas no cuadran. Faltan $${this.diferenciaPropinas.toLocaleString()} por asignar`);
                return;
            }
            this.procesando = true;
            const pagos = this.pagos.map(p => ({
                metodo: p.metodo,
                monto: Number(p.monto),
                propina: Number(p.propina) || 0,
                ref: p.ref || undefined,
            }));
            this.platformService.cerrarFacturaDividida(
                this.facturaId, pagos, propina, 0
            ).subscribe({
                next: () => this.onCobroExitoso('Pago dividido procesado'),
                error: (err) => this.onCobroError(err),
            });
        } else {
            this.procesando = true;
            this.platformService.cerrarFactura(
                this.facturaId, this.metodoPago, propina, 0
            ).subscribe({
                next: () => this.onCobroExitoso(`Método: ${this.metodoPago}`),
                error: (err) => this.onCobroError(err),
            });
        }
    }

    private onCobroExitoso(text: string): void {
        this.pdfService.imprimirFactura(this.facturaId)
            .catch(err => console.error('Error al abrir PDF factura:', err));
        this.alert.success(`¡Cuenta cerrada! ${text}`, 2000);
        this.cobroExitoso.emit(this.facturaId);
    }

    private onCobroError(err: any): void {
        this.procesando = false;
        this.alert.error(err?.error?.message || 'No se pudo cerrar');
    }
}
