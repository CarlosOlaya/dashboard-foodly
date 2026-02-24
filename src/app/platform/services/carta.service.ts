import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { ApiResponse, Categoria, Plato, RecetaInsumo } from '../../auth/interfaces/interfaces';

@Injectable({ providedIn: 'root' })
export class CartaService extends ApiBaseService {

    // ── CATEGORÍAS ──
    getCategorias(): Observable<Categoria[]> {
        return this.http.get<Categoria[]>(`${this.baseUrl}/carta/categoria`);
    }

    crearCategoria(nombre: string): Observable<ApiResponse<Categoria>> {
        return this.http.post<ApiResponse<Categoria>>(`${this.baseUrl}/carta/categoria`, { nombre });
    }

    actualizarCategoria(id: string, nombre: string): Observable<ApiResponse<Categoria>> {
        return this.http.put<ApiResponse<Categoria>>(`${this.baseUrl}/carta/categoria/${id}`, { nombre });
    }

    eliminarCategoria(id: string): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.baseUrl}/carta/categoria/${id}`);
    }

    // ── PLATOS ──
    getCarta(): Observable<Plato[]> {
        return this.http.get<Plato[]>(`${this.baseUrl}/carta/view`);
    }

    getPlato(id: string): Observable<Plato> {
        return this.http.get<Plato>(`${this.baseUrl}/carta/${id}`);
    }

    crearPlato(data: any): Observable<ApiResponse<Plato>> {
        return this.http.post<ApiResponse<Plato>>(`${this.baseUrl}/carta/new`, data);
    }

    actualizarPlato(id: string, data: Partial<Plato>): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/carta/${id}`, data);
    }

    toggleDisponibilidad(id: string, disponibilidad: boolean): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/carta/disponibilidad/${id}`, { disponibilidad });
    }

    eliminarPlato(id: string): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.baseUrl}/carta/${id}`);
    }

    // ── RECETAS ──
    getReceta(platoId: string): Observable<RecetaInsumo[]> {
        return this.http.get<RecetaInsumo[]>(`${this.baseUrl}/carta/receta/${platoId}`);
    }

    setReceta(platoId: string, insumos: { producto_id: string; cantidad: number }[]): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.baseUrl}/carta/receta/${platoId}`, { insumos });
    }

    deleteRecetaInsumo(insumoId: string): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.baseUrl}/carta/receta/insumo/${insumoId}`);
    }
}
