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
