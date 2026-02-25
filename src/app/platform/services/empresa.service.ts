import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { ApiResponse, Tenant } from '../../shared/interfaces';

@Injectable({ providedIn: 'root' })
export class EmpresaService extends ApiBaseService {

    getEmpresa(): Observable<Tenant> {
        return this.http.get<Tenant>(`${this.baseUrl}/empresa`);
    }

    actualizarEmpresa(data: Partial<Tenant>): Observable<Tenant> {
        return this.http.put<Tenant>(`${this.baseUrl}/empresa`, data);
    }

    cambiarPlan(plan: string): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/empresa/plan`, { plan });
    }

    subirImagen(file: File, carpeta: 'platos' | 'logo' | 'general' = 'general'): Observable<{ ok: boolean; url: string; public_id: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ ok: boolean; url: string; public_id: string }>(`${this.baseUrl}/uploads/imagen?carpeta=${carpeta}`, formData);
    }
}
