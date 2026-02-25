/* ── Autenticación ── */

export interface AuthResponse {
    ok: boolean;
    uid: string;
    email: string;
    name: string;
    apellido: string;
    rol: string;
    tenant_id: string;
    token: string;
}

export interface LoginResponse extends AuthResponse {
    mensaje: string;
}

export interface RenewResponse extends AuthResponse { }

export interface Usuario {
    uid: string;
    email: string;
    name: string;
    apellido: string;
    rol: string;
    tenant_id: string;
}
