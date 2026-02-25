/* ── Turnos de caja ── */

import { Empleado } from './entities.interfaces';

export type EstadoTurno = 'abierto' | 'cerrado';

export interface TurnoCaja {
    id: string;
    tenant_id: string;
    empleado_id: string;
    empleado?: Empleado;
    fecha: string;
    hora_apertura: string;
    hora_cierre?: string;
    estado: EstadoTurno;
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
