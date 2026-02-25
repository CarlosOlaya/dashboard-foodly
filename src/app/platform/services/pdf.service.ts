import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Servicio centralizado para abrir PDFs generados por el backend.
 * Elimina la duplicación de fetch + blob + window.open que estaba
 * en servicio.component, comandas.component y cocina.component.
 */
@Injectable({ providedIn: 'root' })
export class PdfService {

    private baseUrl = environment.baseUrl;

    private get token(): string {
        return localStorage.getItem('x-token') || '';
    }

    /**
     * Descarga un PDF de backend y lo abre en una nueva pestaña.
     * @param endpoint - Ruta relativa (ej: '/reportes/comanda/uuid')
     */
    abrirPdf(endpoint: string): Promise<void> {
        const url = `${this.baseUrl}${endpoint}`;

        return fetch(url, { headers: { 'x-token': this.token } })
            .then(res => {
                if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
                return res.blob();
            })
            .then(blob => {
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
            });
    }

    /** Abre PDF de comanda */
    imprimirComanda(comandaId: string): Promise<void> {
        return this.abrirPdf(`/reportes/comanda/${comandaId}`);
    }

    /** Abre PDF de factura */
    imprimirFactura(facturaId: string): Promise<void> {
        return this.abrirPdf(`/reportes/factura/${facturaId}`);
    }

    /** Abre PDF de precuenta */
    imprimirPrecuenta(facturaId: string): Promise<void> {
        return this.abrirPdf(`/reportes/precuenta/${facturaId}`);
    }

    /** Abre ticket PDF de inventario por área */
    imprimirInventario(area: string): Promise<void> {
        return this.abrirPdf(`/reportes/inventario/${area}`);
    }

    /** Abre ticket PDF de cierre de turno (resumen + desglose) */
    imprimirCierreTurno(turnoId: string): Promise<void> {
        return this.abrirPdf(`/reportes/cierre-turno/${turnoId}`);
    }

    /** Abre ticket PDF con las facturas del turno */
    imprimirFacturasTurno(turnoId: string): Promise<void> {
        return this.abrirPdf(`/reportes/facturas-turno/${turnoId}`);
    }
}
