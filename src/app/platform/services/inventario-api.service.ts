import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { ApiResponse, MovimientoInventario, Producto } from '../../auth/interfaces/interfaces';

@Injectable({ providedIn: 'root' })
export class InventarioApiService extends ApiBaseService {

    getProductos(): Observable<Producto[]> {
        return this.http.get<Producto[]>(`${this.baseUrl}/inventario/productos`);
    }

    getStockBajo(): Observable<Producto[]> {
        return this.http.get<Producto[]>(`${this.baseUrl}/inventario/stock-bajo`);
    }

    crearProducto(data: Partial<Producto>): Observable<ApiResponse<Producto>> {
        return this.http.post<ApiResponse<Producto>>(`${this.baseUrl}/inventario/productos`, data);
    }

    registrarMovimiento(data: any): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.baseUrl}/inventario/movimiento`, data);
    }

    getMovimientos(productoId?: string): Observable<MovimientoInventario[]> {
        let url = `${this.baseUrl}/inventario/movimientos`;
        if (productoId) url += `?producto_id=${productoId}`;
        return this.http.get<MovimientoInventario[]>(url);
    }

    actualizarProducto(id: string, data: Partial<Producto>): Observable<ApiResponse<Producto>> {
        return this.http.put<ApiResponse<Producto>>(`${this.baseUrl}/inventario/productos/${id}`, data);
    }

    eliminarProducto(id: string): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.baseUrl}/inventario/productos/${id}`);
    }

    getResumenInventario(): Observable<{ total_productos: number; stock_bajo: number; agotados: number; movimientos_hoy: number }> {
        return this.http.get<any>(`${this.baseUrl}/inventario/resumen`);
    }

    registrarTomaInventario(items: { producto_id: string; conteo_fisico: number }[]): Observable<ApiResponse> {
        return this.http.post<any>(`${this.baseUrl}/inventario/toma`, { items });
    }
}
