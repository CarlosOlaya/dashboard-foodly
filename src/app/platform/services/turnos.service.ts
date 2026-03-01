import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { ApiResponse, CerrarTurnoResponse, TurnoCaja, ResumenTurnoEnVivo } from '../../shared/interfaces';

@Injectable({ providedIn: 'root' })
export class TurnosService extends ApiBaseService {

    abrirTurno(efectivoInicial = 0): Observable<ApiResponse<TurnoCaja>> {
        return this.http.post<ApiResponse<TurnoCaja>>(`${this.baseUrl}/arqueo/abrir`,
            { efectivo_inicial: efectivoInicial },
        );
    }

    cerrarTurno(turnoId: string, efectivoContado: number, observaciones?: string): Observable<CerrarTurnoResponse> {
        return this.http.put<CerrarTurnoResponse>(`${this.baseUrl}/arqueo/${turnoId}/cerrar`,
            { efectivo_contado: efectivoContado, observaciones },
        );
    }

    getTurnoActivo(): Observable<TurnoCaja | null> {
        return this.http.get<TurnoCaja | null>(`${this.baseUrl}/arqueo/activo`);
    }

    getHistorialTurnos(): Observable<TurnoCaja[]> {
        return this.http.get<TurnoCaja[]>(`${this.baseUrl}/arqueo/historial`);
    }

    getTurno(id: string): Observable<TurnoCaja> {
        return this.http.get<TurnoCaja>(`${this.baseUrl}/arqueo/${id}`);
    }

    getResumenTurnoEnVivo(): Observable<ResumenTurnoEnVivo> {
        return this.http.get<ResumenTurnoEnVivo>(`${this.baseUrl}/arqueo/activo/resumen`);
    }
}
