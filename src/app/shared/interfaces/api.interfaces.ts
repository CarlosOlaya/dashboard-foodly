/* ── Respuestas genéricas del API ── */

import { Empleado } from './entities.interfaces';
import { TurnoCaja } from './turno.interfaces';

export interface ApiResponse<T = unknown> {
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

/* ── Respuesta de enviar comanda ── */
export interface EnviarComandaResponse extends ApiResponse {
    comandas?: Array<{ id: string }>;
}

/* ── Respuesta de anular/ajustar detalle ── */
export interface DetalleAccionResponse extends ApiResponse {
    comanda_id?: string;
}

/* ── Respuesta de cerrar turno ── */
export interface CerrarTurnoResponse extends ApiResponse {
    resumen?: {
        total_ventas: number;
        num_facturas: number;
        num_anulaciones: number;
        total_propinas: number;
        total_efectivo: number;
        total_datafono: number;
        total_transferencia: number;
        total_descuentos: number;
        efectivo_inicial: number;
        efectivo_esperado: number;
        efectivo_contado: number;
        diferencia: number;
        propina_efectivo: number;
        propina_datafono: number;
        propina_transferencia: number;
    };
}

/* ── Toma de inventario ── */
export interface TomaInventarioResponse extends ApiResponse {
    ajustes?: number;
    sinCambio?: number;
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

/* ── Resumen turno en vivo ── */
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

/* ── ngx-charts ── */
export interface NgxChartColorScheme {
    name?: string;
    selectable?: boolean;
    group?: string;
    domain: string[];
}

export interface NgxChartDataItem {
    name: string;
    value: number;
}

export interface NgxChartSeriesItem {
    name: string;
    series: NgxChartDataItem[];
}

/* ── Dialog data ── */
export interface CategoriasDialogData {
    selectedId?: string;
}
