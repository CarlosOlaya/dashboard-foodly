/* ══════════════════════════════════════════════════════════
   Analytics / Reportes — TypeScript Interfaces
   ══════════════════════════════════════════════════════════ */

export interface AnalyticsResumen {
    total_facturas: number;
    venta_bruta: number;
    total_descuentos: number;
    venta_neta: number;
    total_propinas: number;
    total_servicio: number;
    total_comensales: number;
    ticket_promedio: number;
    consumo_promedio_persona: number;
}

export interface VentaDia {
    fecha: string;
    facturas: number;
    total: number;
    propinas: number;
}

export interface VentaHora {
    hora: number;
    facturas: number;
    total: number;
}

export interface ProductoVendido {
    plato_id: string;
    nombre: string;
    categoria: string;
    cantidad: number;
    ingreso_bruto: number;
    descuentos: number;
    ingreso_neto: number;
}

export interface VentaCategoria {
    categoria: string;
    cantidad: number;
    total: number;
}

export interface MetodoPagoItem {
    metodo: string;
    transacciones: number;
    total: number;
    propinas: number;
}

export interface PropinaDia {
    fecha: string;
    propinas: number;
    servicio: number;
}

export interface PropinaEmpleado {
    empleado: string;
    facturas: number;
    propinas: number;
    servicio: number;
    ventas: number;
}

export interface PropinaMetodo {
    metodo: string;
    propinas: number;
}

export interface PropinasData {
    por_dia: PropinaDia[];
    por_empleado: PropinaEmpleado[];
    por_metodo: PropinaMetodo[];
}

export interface EmpleadoRendimiento {
    empleado_id: string;
    nombre: string;
    facturas: number;
    ventas: number;
    propinas: number;
    comensales: number;
    descuentos: number;
    ticket_promedio: number;
}

export interface DescuentosData {
    facturas_con_descuento: number;
    total_descuento_mesa: number;
    items_con_descuento: number;
    total_descuento_items: number;
    cortesias: number;
    valor_cortesias: number;
    top_items: { nombre: string; total_descuento: number; cantidad: number }[];
}

export interface AnalyticsReport {
    rango: { desde: string; hasta: string };
    resumen: AnalyticsResumen;
    ventas_por_dia: VentaDia[];
    ventas_por_hora: VentaHora[];
    productos: ProductoVendido[];
    categorias: VentaCategoria[];
    metodos_pago: MetodoPagoItem[];
    propinas: PropinasData;
    empleados: EmpleadoRendimiento[];
    descuentos: DescuentosData;
}
