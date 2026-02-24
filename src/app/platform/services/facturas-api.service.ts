import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { ApiResponse, Factura, PaginatedResponse, VentaDiaria, DashboardResponse, PrecuentaResponse } from '../../auth/interfaces/interfaces';

@Injectable({ providedIn: 'root' })
export class FacturasApiService extends ApiBaseService {

    getFacturas(filtros?: { estado?: string; desde?: string; hasta?: string; page?: number; limit?: number }): Observable<PaginatedResponse<Factura>> {
        let url = `${this.baseUrl}/facturas/view`;
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
        return this.http.get<Factura>(`${this.baseUrl}/facturas/${id}`);
    }

    cerrarFactura(id: string, metodoPago: string, propina = 0, descuentoPct = 0): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/facturas/${id}/cerrar`,
            { metodo_pago: metodoPago, propina, descuento_pct: descuentoPct },
        );
    }

    cerrarFacturaDividida(id: string, pagos: Array<{ metodo: string; monto: number; propina?: number; ref?: string; pagado_por?: string }>, propina = 0, descuentoPct = 0): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/facturas/${id}/cerrar-dividida`,
            { pagos, propina, descuento_pct: descuentoPct },
        );
    }

    reabrirFactura(id: string, mesaId: string): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/facturas/${id}/reabrir`, { mesa_id: mesaId });
    }

    anularFactura(id: string, motivo: string): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/facturas/${id}/anular`, { motivo });
    }

    anularDetalle(detalleId: string, motivo: string): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/facturas/detalle/${detalleId}/anular`, { motivo });
    }

    ajustarCantidadDetalle(detalleId: string, nuevaCantidad: number, motivo: string): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/facturas/detalle/${detalleId}/ajustar`, { nueva_cantidad: nuevaCantidad, motivo });
    }

    transferirItems(detalleIds: string[], mesaDestinoId: string, motivo?: string): Observable<ApiResponse> {
        return this.http.put<any>(`${this.baseUrl}/facturas/transferir-items`, { detalle_ids: detalleIds, mesa_destino_id: mesaDestinoId, motivo });
    }

    descuentoItem(detalleId: string, tipo: 'porcentaje' | 'valor', valor: number): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/facturas/detalle/${detalleId}/descuento`, { tipo, valor });
    }

    descuentoMesa(facturaId: string, tipo: 'porcentaje' | 'valor', valor: number): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/facturas/${facturaId}/descuento`, { tipo, valor });
    }

    getPrecuenta(facturaId: string, servicioPct = 0): Observable<PrecuentaResponse> {
        return this.http.get<any>(`${this.baseUrl}/facturas/precuenta/${facturaId}?servicio_pct=${servicioPct}`);
    }

    getVentasDiarias(): Observable<VentaDiaria[]> {
        return this.http.get<any[]>(`${this.baseUrl}/facturas/ventas/diarias`);
    }

    getDashboard(): Observable<DashboardResponse> {
        return this.http.get<any>(`${this.baseUrl}/facturas/dashboard`);
    }
}
