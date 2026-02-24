import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { ApiResponse, Empleado } from '../../auth/interfaces/interfaces';

@Injectable({ providedIn: 'root' })
export class EmpleadosService extends ApiBaseService {

    getEmpleados(): Observable<Empleado[]> {
        return this.http.get<Empleado[]>(`${this.baseUrl}/empleados/view`);
    }

    getEmpleado(id: string): Observable<Empleado> {
        return this.http.get<Empleado>(`${this.baseUrl}/empleados/${id}`);
    }

    crearEmpleado(data: Partial<Empleado>): Observable<Empleado> {
        return this.http.post<Empleado>(`${this.baseUrl}/empleados/new`, data);
    }

    actualizarEmpleado(id: string, data: Partial<Empleado>): Observable<Empleado> {
        return this.http.put<Empleado>(`${this.baseUrl}/empleados/${id}`, data);
    }

    eliminarEmpleado(id: string): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.baseUrl}/empleados/${id}`);
    }
}
