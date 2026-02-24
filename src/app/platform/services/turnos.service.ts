import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { ApiResponse, TurnoCaja, ResumenTurnoEnVivo } from '../../auth/interfaces/interfaces';

@Injectable({ providedIn: 'root' })
export class TurnosService extends ApiBaseService {

    abrirTurno(efectivoInicial = 0): Observable<ApiResponse<TurnoCaja>> {
        return this.http.post<ApiResponse<TurnoCaja>>(`${this.baseUrl}/turnos/abrir`,
            { efectivo_inicial: efectivoInicial },
        );
    }

    cerrarTurno(turnoId: string, efectivoContado: number, observaciones?: string): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/turnos/${turnoId}/cerrar`,
            { efectivo_contado: efectivoContado, observaciones },
        );
    }

    getTurnoActivo(): Observable<TurnoCaja | null> {
        return this.http.get<TurnoCaja | null>(`${this.baseUrl}/turnos/activo`);
    }

    getHistorialTurnos(): Observable<TurnoCaja[]> {
        return this.http.get<TurnoCaja[]>(`${this.baseUrl}/turnos/historial`);
    }

    getTurno(id: string): Observable<TurnoCaja> {
        return this.http.get<TurnoCaja>(`${this.baseUrl}/turnos/${id}`);
    }

    getResumenTurnoEnVivo(): Observable<ResumenTurnoEnVivo> {
        return this.http.get<any>(`${this.baseUrl}/turnos/activo/resumen`);
    }
}
