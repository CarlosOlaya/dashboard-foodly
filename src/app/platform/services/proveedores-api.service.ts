import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { ApiResponse, Proveedor } from '../../shared/interfaces';

@Injectable({ providedIn: 'root' })
export class ProveedoresApiService extends ApiBaseService {

    getProveedores(): Observable<Proveedor[]> {
        return this.http.get<Proveedor[]>(`${this.baseUrl}/proveedores/view`);
    }

    getProveedor(id: string): Observable<Proveedor> {
        return this.http.get<Proveedor>(`${this.baseUrl}/proveedores/${id}`);
    }

    crearProveedor(data: Partial<Proveedor>): Observable<ApiResponse<Proveedor>> {
        return this.http.post<ApiResponse<Proveedor>>(`${this.baseUrl}/proveedores/new`, data);
    }

    actualizarProveedor(id: string, data: Partial<Proveedor>): Observable<Proveedor> {
        return this.http.put<Proveedor>(`${this.baseUrl}/proveedores/${id}`, data);
    }

    eliminarProveedor(id: string): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.baseUrl}/proveedores/${id}`);
    }
}
