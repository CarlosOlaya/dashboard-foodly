/* ── Inventario ── */

import { Categoria, Empleado } from './entities.interfaces';

export interface Producto {
    id: string;
    tenant_id: string;
    nombre: string;
    descripcion?: string;
    stock: number;
    stock_minimo: number;
    stock_maximo?: number;
    tipo_stock?: string;
    ubicacion_almacen?: string;
    perecedero?: boolean;
    categoria_id?: string;
    categoria?: Categoria;
    activo: boolean;
}

export interface MovimientoInventario {
    id: string;
    tenant_id: string;
    producto_id: string;
    producto?: Producto;
    tipo: string;
    cantidad: number;
    stock_anterior: number;
    stock_nuevo: number;
    costo_unitario?: number;
    lote?: string;
    fecha_vencimiento?: string;
    motivo?: string;
    empleado_id: string;
    empleado?: Empleado;
    created_at: string;
}

export interface RecetaInsumo {
    id: string;
    plato_id: string;
    producto_id: string;
    producto?: Producto;
    cantidad: number;
    created_at: string;
}

/* ── Request para registrar movimiento ── */
export interface MovimientoRequest {
    producto_id: string;
    tipo: string;
    cantidad: number;
    costo_unitario?: number;
    lote?: string;
    fecha_vencimiento?: string;
    motivo?: string;
}

/* ── Resumen de inventario ── */
export interface ResumenInventario {
    total_productos: number;
    stock_bajo: number;
    agotados: number;
    movimientos_hoy: number;
}
