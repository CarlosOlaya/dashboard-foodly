import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { ApiResponse, Factura, Mesa } from '../../auth/interfaces/interfaces';

@Injectable({ providedIn: 'root' })
export class MesasService extends ApiBaseService {

    getMesas(): Observable<Mesa[]> {
        return this.http.get<Mesa[]>(`${this.baseUrl}/mesas/view`);
    }

    abrirMesa(mesaId: string, empleadoId: string, comensales = 1): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/mesas/${mesaId}/abrir`,
            { empleado_id: empleadoId, num_comensales: comensales },
        );
    }

    actualizarEstadoMesa(mesaId: string, estado: string, empleadoId?: string): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/mesas/${mesaId}/estado`,
            { estado, empleado_id: empleadoId },
        );
    }

    actualizarComensales(mesaId: string, comensales: number): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/mesas/${mesaId}/comensales`,
            { num_comensales: comensales },
        );
    }

    liberarMesa(mesaId: string): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/mesas/${mesaId}/liberar`, {});
    }

    getFacturaActivaMesa(mesaId: string): Observable<Factura> {
        return this.http.get<Factura>(`${this.baseUrl}/mesas/${mesaId}/factura`);
    }
}
