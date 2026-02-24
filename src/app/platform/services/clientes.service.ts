import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { ApiResponse, Cliente } from '../../auth/interfaces/interfaces';

@Injectable({ providedIn: 'root' })
export class ClientesService extends ApiBaseService {

    getClientes(): Observable<Cliente[]> {
        return this.http.get<Cliente[]>(`${this.baseUrl}/clientes/view`);
    }

    getCliente(id: string): Observable<Cliente> {
        return this.http.get<Cliente>(`${this.baseUrl}/clientes/${id}`);
    }

    crearCliente(data: Partial<Cliente>): Observable<ApiResponse<Cliente>> {
        return this.http.post<ApiResponse<Cliente>>(`${this.baseUrl}/clientes/new`, data);
    }

    actualizarCliente(id: string, data: Partial<Cliente>): Observable<Cliente> {
        return this.http.put<Cliente>(`${this.baseUrl}/clientes/${id}`, data);
    }

    eliminarCliente(id: string): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.baseUrl}/clientes/${id}`);
    }
}
