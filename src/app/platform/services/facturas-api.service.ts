import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { ApiResponse, DetalleAccionResponse, Factura, FacturaFiltros, PaginatedResponse, VentaDiaria, DashboardResponse, PrecuentaResponse } from '../../shared/interfaces';

@Injectable({ providedIn: 'root' })
export class FacturasApiService extends ApiBaseService {

    getFacturas(filtros?: FacturaFiltros): Observable<PaginatedResponse<Factura>> {
        let url = `${this.baseUrl}/facturacion/view`;
        const params: string[] = [];
        if (filtros?.estado) params.push(`estado=${filtros.estado}`);
        if (filtros?.desde) params.push(`desde=${filtros.desde}`);
        if (filtros?.hasta) params.push(`hasta=${filtros.hasta}`);
        if (filtros?.page) params.push(`page=${filtros.page}`);
        if (filtros?.limit) params.push(`limit=${filtros.limit}`);
        if (params.length) url += '?' + params.join('&');
        return this.http.get<PaginatedResponse<Factura>>(url);
    }

    getFactura(id: string): Observable<Factura> {
        return this.http.get<Factura>(`${this.baseUrl}/facturacion/${id}`);
    }

    cerrarFactura(id: string, metodoPago: string, propina = 0, descuentoPct = 0): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/facturacion/${id}/cerrar`,
            { metodo_pago: metodoPago, propina, descuento_pct: descuentoPct },
        );
    }

    cerrarFacturaDividida(id: string, pagos: Array<{ metodo: string; monto: number; propina?: number; ref?: string; pagado_por?: string }>, propina = 0, descuentoPct = 0): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/facturacion/${id}/cerrar-dividida`,
            { pagos, propina, descuento_pct: descuentoPct },
        );
    }

    reabrirFactura(id: string, mesaId: string): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/facturacion/${id}/reabrir`, { mesa_id: mesaId });
    }

    anularFactura(id: string, motivo: string): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/facturacion/${id}/anular`, { motivo });
    }

    anularDetalle(detalleId: string, motivo: string): Observable<DetalleAccionResponse> {
        return this.http.put<DetalleAccionResponse>(`${this.baseUrl}/facturacion/detalle/${detalleId}/anular`, { motivo });
    }

    ajustarCantidadDetalle(detalleId: string, nuevaCantidad: number, motivo: string): Observable<DetalleAccionResponse> {
        return this.http.put<DetalleAccionResponse>(`${this.baseUrl}/facturacion/detalle/${detalleId}/ajustar`, { nueva_cantidad: nuevaCantidad, motivo });
    }

    transferirItems(detalleIds: string[], mesaDestinoId: string, motivo?: string): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/facturacion/transferir-items`, { detalle_ids: detalleIds, mesa_destino_id: mesaDestinoId, motivo });
    }

    descuentoItem(detalleId: string, tipo: 'porcentaje' | 'valor', valor: number, esCortesia = false): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/facturacion/detalle/${detalleId}/descuento`, { tipo, valor, es_cortesia: esCortesia });
    }

    descuentoMesa(facturaId: string, tipo: 'porcentaje' | 'valor', valor: number, esCortesia = false): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/facturacion/${facturaId}/descuento`, { tipo, valor, es_cortesia: esCortesia });
    }

    getPrecuenta(facturaId: string, servicioPct = 0): Observable<PrecuentaResponse> {
        return this.http.get<PrecuentaResponse>(`${this.baseUrl}/facturacion/precuenta/${facturaId}?servicio_pct=${servicioPct}`);
    }

    getVentasDiarias(): Observable<VentaDiaria[]> {
        return this.http.get<VentaDiaria[]>(`${this.baseUrl}/facturacion/ventas/diarias`);
    }

    getDashboard(): Observable<DashboardResponse> {
        return this.http.get<DashboardResponse>(`${this.baseUrl}/facturacion/dashboard`);
    }

    toggleFacturaElectronica(facturaId: string, value: boolean): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/facturacion/${facturaId}/factura-electronica`, { es_factura_electronica: value });
    }

    corregirFactura(facturaId: string, datos: { metodo_pago?: string; propina?: number; motivo: string }): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/facturacion/${facturaId}/corregir`, datos);
    }

    getCorrecciones(facturaId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/facturacion/${facturaId}/correcciones`);
    }

    reimprimir(facturaId: string): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.baseUrl}/facturacion/reimprimir/${facturaId}`, {});
    }

    emitirNotaCredito(facturaId: string, datos: { motivo: string; mesa_id: string; tipo?: string }): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/facturacion/${facturaId}/nota-credito`, datos);
    }

    getNotasCredito(facturaId?: string): Observable<any[]> {
        const query = facturaId ? `?factura_id=${facturaId}` : '';
        return this.http.get<any[]>(`${this.baseUrl}/facturacion/notas-credito${query}`);
    }

    // ── AUDITORÍA ──
    getAuditLog(filtros: Record<string, string> = {}): Observable<any> {
        const params = new URLSearchParams(filtros).toString();
        return this.http.get<any>(`${this.baseUrl}/facturacion/audit-log?${params}`);
    }

    validarConsecutivos(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/facturacion/audit-consecutivos`);
    }

    getAuditResumen(desde?: string, hasta?: string): Observable<any> {
        const params = new URLSearchParams();
        if (desde) params.set('desde', desde);
        if (hasta) params.set('hasta', hasta);
        return this.http.get<any>(`${this.baseUrl}/facturacion/audit-resumen?${params}`);
    }

    getAuditNC(desde?: string, hasta?: string): Observable<any[]> {
        const params = new URLSearchParams();
        if (desde) params.set('desde', desde);
        if (hasta) params.set('hasta', hasta);
        return this.http.get<any[]>(`${this.baseUrl}/facturacion/audit-notas-credito?${params}`);
    }

    getAuditCorrecciones(desde?: string, hasta?: string): Observable<any[]> {
        const params = new URLSearchParams();
        if (desde) params.set('desde', desde);
        if (hasta) params.set('hasta', hasta);
        return this.http.get<any[]>(`${this.baseUrl}/facturacion/audit-correcciones?${params}`);
    }
}
