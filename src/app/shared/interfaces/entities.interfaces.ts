/* ── Entidades base del dominio ── */

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

export type EstadoMesa = 'libre' | 'ocupada' | 'impresa';

export interface Mesa {
    id: string;
    tenant_id: string;
    numero: number;
    capacidad: number;
    estado: EstadoMesa;
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
    stock_disponible?: number | null;
    tiempo_preparacion_min?: number;
    activo: boolean;
}

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
