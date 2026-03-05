import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { AnalyticsReport } from '../../shared/interfaces';

@Injectable({ providedIn: 'root' })
export class AnalyticsApiService extends ApiBaseService {

    private readonly endpoint = `${this.baseUrl}/analytics`;

    /** Full consolidated report for a date range */
    getReporteCompleto(desde: string, hasta: string): Observable<AnalyticsReport> {
        return this.http.get<AnalyticsReport>(this.endpoint, {
            params: { desde, hasta },
        });
    }

    /** Send report to thermal printer via print server */
    imprimirVentas(desde: string, hasta: string): Observable<{ ok: boolean; mensaje: string }> {
        return this.http.post<{ ok: boolean; mensaje: string }>(
            `${this.endpoint}/imprimir-ventas`,
            { desde, hasta },
        );
    }
}
