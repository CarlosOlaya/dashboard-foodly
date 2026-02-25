/* ── Facturación ── */

import { Plato, Mesa, Empleado, Cliente } from './entities.interfaces';

export type EstadoFactura = 'abierta' | 'cerrada' | 'anulada';

export interface DetalleFactura {
    id: string;
    factura_servicio_id: string;
    plato_id: string;
    plato?: Plato;
    cantidad: number;
    precio_unitario: number;
    comentario?: string;
    descuento_porcentaje?: number;
    descuento_monto?: number;
    estado_pedido?: string;
    hora_pedido?: string;
    hora_entrega?: string;
    created_at?: string;
}

export interface FacturaPago {
    id: string;
    factura_servicio_id: string;
    metodo_pago: string;
    monto: number;
    propina?: number;
    referencia?: string;
    pagado_por?: string;
    created_at?: string;
}

export interface Factura {
    id: string;
    tenant_id: string;
    numero_factura?: string;
    mesa_id: string;
    mesa?: Mesa;
    empleado_id: string;
    empleado?: Empleado;
    cliente_id?: string;
    cliente?: Cliente;
    turno_caja_id?: string;
    num_comensales?: number;
    fecha_apertura: string;
    fecha_cierre?: string;
    estado: EstadoFactura;
    subtotal: number;
    porcentaje_servicio?: number;
    monto_servicio?: number;
    porcentaje_iva?: number;
    monto_iva?: number;
    descuento_porcentaje?: number;
    descuento_monto?: number;
    propina?: number;
    total: number;
    metodo_pago?: string;
    es_pago_dividido?: boolean;
    motivo_anulacion?: string;
    detalles?: DetalleFactura[];
    pagos?: FacturaPago[];
}

/* ── Pedido (local, para servicio de mesa) ── */
export interface PedidoItem {
    id?: string;
    plato_id: string;
    plato_nombre: string;
    cantidad: number;
    precio: number;
    area?: string;
    comentario?: string;
    estado_pedido?: string;
    hora_pedido?: string;
    descuento_porcentaje?: number;
    descuento_monto?: number;
}

/* ── Factura activa de mesa (respuesta GET /mesas/:id/factura) ── */
export interface FacturaActivaMesa {
    id: string;
    mesa_numero: number;
    mesero: string;
    subtotal: number;
    descuento_monto: number;
    num_comensales?: number;
    items: Array<{
        id: string;
        plato_id: string;
        plato_nombre: string;
        plato?: Plato;
        cantidad: number;
        precio_unitario: number;
        precio?: number;
        area?: string;
        comentario?: string;
        estado_pedido: string;
        hora_pedido?: string;
        created_at?: string;
        descuento_porcentaje?: number;
        descuento_monto?: number;
    }>;
}

/* ── Filtros para facturación ── */
export interface FacturaFiltros {
    estado?: string;
    desde?: string;
    hasta?: string;
    page?: number;
    limit?: number;
}

/* ── Precuenta ── */
export interface PrecuentaResponse {
    ok: boolean;
    factura_id: string;
    mesa_numero: number;
    items: Array<{ nombre: string; cantidad: number; precio_unitario: number; subtotal: number; descuento: number }>;
    subtotal: number;
    descuento_mesa: number;
    servicio: number;
    iva: number;
    propina: number;
    total: number;
}
