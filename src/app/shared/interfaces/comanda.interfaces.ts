/* ── Comandas ── */

export interface ComandaItem {
    id: string;
    comanda_id: string;
    detalle_factura_id: string;
    nombre_producto: string;
    cantidad: number;
    precio_unitario: number;
    comentario?: string;
}

export type EstadoComanda = 'pendiente' | 'en_proceso' | 'impresa' | 'lista' | 'entregada' | 'completada' | 'anulada';

export interface Comanda {
    id: string;
    tenant_id: string;
    factura_servicio_id: string;
    numero_comanda: number;
    area_destino: string;
    numero_mesa: number;
    nombre_mesero: string;
    num_comensales: number;
    estado: EstadoComanda;
    payload: unknown;
    items?: ComandaItem[];
    created_at: string;
}

/* ── Request para enviar comanda ── */
export interface ComandaItemRequest {
    plato_id: string;
    cantidad: number;
    comentario?: string;
}
