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
}
