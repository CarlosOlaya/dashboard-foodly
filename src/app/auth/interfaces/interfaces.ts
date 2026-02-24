/* ── Interfaces que mapean las respuestas del API NestJS ── */

export interface LoginResponse {
    ok: boolean;
    mensaje: string;
    uid: string;
    email: string;
    name: string;
    apellido: string;
    rol: string;
    tenant_id: string;
    token: string;
}

export interface RenewResponse {
    ok: boolean;
    uid: string;
    name: string;
    apellido: string;
    rol: string;
    email: string;
    tenant_id: string;
    token: string;
}

export interface Usuario {
    uid: string;
    email: string;
    name: string;
    apellido: string;
    rol: string;
    tenant_id: string;
}

/* ── Entities ── */

export interface Empleado {
    id: string;
    tenant_id: string;
    nombre: string;
    apellido1: string;
    apellido2?: string;
    tipo_documento?: string;
    documento?: string;
    email?: string;
    telefono?: string;
    cargo?: string;
    salario?: number;
    activo: boolean;
    created_at: string;
}

export interface Mesa {
    id: string;
    tenant_id: string;
    numero: number;
    capacidad: number;
    estado: string;          // 'libre' | 'ocupada' | 'impresa'
    ubicacion?: string;
    empleado_id?: string;
    empleado?: Empleado;
    activo: boolean;
}

export interface Categoria {
    id: string;
    tenant_id: string;
    nombre: string;
    orden?: number;
    icono_url?: string;
    activo: boolean;
}

export interface Plato {
    id: string;
    tenant_id: string;
    nombre: string;
    area?: string;
    categoria_id?: string;
    categoria?: Categoria;
    descripcion?: string;
    precio_venta: number;
    costo_estimado?: number;
    imagen_url?: string;
    disponibilidad: boolean;
    controla_stock?: boolean;
    tiempo_preparacion_min?: number;
    activo: boolean;
}

/* RecetaInsumo está definida más abajo, junto a Producto */

export interface Cliente {
    id: string;
    tenant_id: string;
    nombre: string;
    apellido1?: string;
    apellido2?: string;
    documento?: string;
    email?: string;
    telefono?: string;
    genero?: string;
    fecha_nacimiento?: string;
    notas?: string;
    activo: boolean;
    created_at: string;
}

export interface Proveedor {
    id: string;
    tenant_id: string;
    nombre: string;
    nit?: string;
    telefono?: string;
    email?: string;
    nombre_asesor?: string;
    dia_entrega?: string;
    dia_pedido?: string;
    notas?: string;
    activo: boolean;
}

export interface DetalleFactura {
    id: string;
    factura_servicio_id: string;
    plato_id: string;
    plato?: Plato;
    cantidad: number;
    precio_unitario: number;
    comentario?: string;
}

export interface FacturaPago {
    id: string;
    factura_servicio_id: string;
    metodo_pago: string;
    monto: number;
    referencia?: string;
    pagado_por?: string;
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
    estado: string;        // 'abierta' | 'cerrada' | 'anulada'
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

export interface Comanda {
    id: string;
    tenant_id: string;
    factura_servicio_id: string;
    numero_comanda: number;
    area_destino: string;
    numero_mesa: number;
    nombre_mesero: string;
    num_comensales: number;
    estado: string;
    payload: any;
    items?: ComandaItem[];
    created_at: string;
}

export interface ComandaItem {
    id: string;
    comanda_id: string;
    detalle_factura_id: string;
    nombre_producto: string;
    cantidad: number;
    precio_unitario: number;
    comentario?: string;
}

export interface TurnoCaja {
    id: string;
    tenant_id: string;
    empleado_id: string;
    empleado?: Empleado;
    fecha: string;
    hora_apertura: string;
    hora_cierre?: string;
    estado: string;  // 'abierto' | 'cerrado'
    efectivo_inicial: number;
    total_ventas: number;
    total_efectivo: number;
    total_datafono: number;
    total_transferencia: number;
    total_credito: number;
    total_propinas: number;
    total_descuentos: number;
    total_gastos: number;
    num_facturas: number;
    num_anulaciones: number;
    efectivo_contado?: number;
    efectivo_esperado: number;
    diferencia: number;
    observaciones?: string;
    created_at: string;
    updated_at: string;
}

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

/* ── Tenant / Empresa ── */
export interface Tenant {
    id: string;
    nombre: string;
    nit?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    logo_url?: string;
    color_primario: string;
    color_secundario: string;
    color_acento: string;
    moneda: string;
    porcentaje_iva: number;
    porcentaje_servicio: number;
    zona_horaria: string;
    prefijo_factura: string;
    siguiente_num_factura: number;
    resolucion_dian?: string;
    rango_factura_inicio?: number;
    rango_factura_fin?: number;
    plan: string;
    activo: boolean;
    created_at: string;
    updated_at: string;
}


/* ── API Responses ── */
export interface ApiResponse<T = any> {
    ok: boolean;
    mensaje: string;
    data?: T;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

/* ── Dashboard / Analytics ── */
export interface VentaDiaria {
    fecha: string;
    total: number;
    num_facturas: number;
}

export interface DashboardKpis {
    ventas_hoy: number;
    facturas_hoy: number;
    ventas_mes: number;
    facturas_mes: number;
    ticket_promedio: number;
    propinas_mes: number;
}

export interface DashboardResponse {
    kpis: DashboardKpis;
    ventas_diarias: Array<{ fecha: string; total: number; facturas: number }>;
    top_platos: Array<{ nombre: string; cantidad: number; total: number }>;
    por_metodo_pago: Array<{ metodo: string; facturas: number; total: number }>;
}

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

export interface ResumenTurnoEnVivo {
    turno: TurnoCaja;
    total_ventas: number;
    total_efectivo: number;
    total_datafono: number;
    total_transferencia: number;
    total_credito: number;
    total_propinas: number;
    total_descuentos: number;
    propina_efectivo: number;
    propina_datafono: number;
    propina_transferencia: number;
    propina_credito: number;
    efectivo_esperado: number;
    num_facturas_cerradas: number;
    num_facturas_abiertas: number;
    num_anulaciones: number;
    mesas_ocupadas: number;
    mesas_totales: number;
    recientes: Array<{
        id: string;
        numero_factura: string;
        mesa_numero: number;
        mesero: string;
        total: number;
        metodo_pago: string;
        fecha_cierre: string;
    }>;
}
