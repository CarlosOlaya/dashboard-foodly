import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { ApiResponse, Comanda } from '../../auth/interfaces/interfaces';

@Injectable({ providedIn: 'root' })
export class ComandasApiService extends ApiBaseService {

    enviarComanda(facturaId: string, items: Array<{ plato_id: string; cantidad: number; comentario?: string }>): Observable<ApiResponse> {
        return this.http.post<any>(`${this.baseUrl}/comandas/new`, { factura_id: facturaId, items });
    }

    generarComanda(facturaId: string, items: any[]): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.baseUrl}/comandas/new`,
            { factura_id: facturaId, items },
        );
    }

    getComandasActivas(area?: string): Observable<Comanda[]> {
        let url = `${this.baseUrl}/comandas/activas`;
        if (area) url += `?area=${area}`;
        return this.http.get<Comanda[]>(url);
    }

    marcarComandaImpresa(id: string): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/comandas/${id}/impresa`, {});
    }

    marcarComandaLista(id: string): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/comandas/${id}/lista`, {});
    }

    marcarComandaEntregada(id: string): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/comandas/${id}/entregada`, {});
    }

    getComandasHoy(): Observable<Comanda[]> {
        return this.http.get<Comanda[]>(`${this.baseUrl}/comandas/hoy`);
    }
}
