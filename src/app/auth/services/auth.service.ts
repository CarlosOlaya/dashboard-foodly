import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse, RenewResponse, Usuario } from '../../shared/interfaces';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private baseUrl = environment.baseUrl;
    private _usuario!: Usuario;

    get usuario(): Usuario { return { ...this._usuario }; }
    get token(): string { return localStorage.getItem('x-token') || ''; }
    get isAdmin(): boolean { return this._usuario?.rol === 'admin'; }
    get isCajero(): boolean { return this._usuario?.rol === 'cajero'; }
    get canCobrar(): boolean { return this.isAdmin || this.isCajero; }

    constructor(private http: HttpClient) { }

    private guardarToken(token: string): void {
        localStorage.setItem('x-token', token);
    }



    login(email: string, password: string): Observable<string> {
        const url = `${this.baseUrl}/auth`;
        return this.http.post<LoginResponse>(url, { email, password }).pipe(
            tap(resp => {
                if (resp.ok) {
                    this.guardarToken(resp.token);
                    this._usuario = {
                        uid: resp.uid,
                        email: resp.email,
                        name: resp.name,
                        apellido: resp.apellido,
                        rol: resp.rol,
                        tenant_id: resp.tenant_id,
                    };
                }
            }),
            map(resp => resp.ok ? 'ok' : 'auth_error'),
            catchError(err => {
                if (err.status === 0) return of('connection_error');
                return of('auth_error');
            })
        );
    }

    register(tenant_id: string, email: string, password: string): Observable<boolean> {
        const url = `${this.baseUrl}/auth/new`;
        return this.http.post<LoginResponse>(url, { tenant_id, email, password, rol: 'mesero' }).pipe(
            tap(resp => {
                if (resp.ok) this.guardarToken(resp.token);
            }),
            map(resp => resp.ok),
            catchError(() => of(false))
        );
    }

    registerWithRole(tenant_id: string, email: string, password: string, rol: string): Observable<boolean> {
        const url = `${this.baseUrl}/auth/new`;
        return this.http.post<LoginResponse>(url, { tenant_id, email, password, rol }).pipe(
            tap(resp => {
                if (resp.ok) this.guardarToken(resp.token);
            }),
            map(resp => resp.ok),
            catchError(() => of(false))
        );
    }

    onboard(data: {
        nombre_restaurante: string;
        nit?: string;
        direccion?: string;
        telefono?: string;
        nombre_admin: string;
        apellido_admin: string;
        email: string;
        password: string;
        plan?: string;
    }): Observable<boolean> {
        const url = `${this.baseUrl}/auth/onboard`;
        return this.http.post<LoginResponse>(url, data).pipe(
            tap(resp => {
                if (resp.ok) {
                    this.guardarToken(resp.token);
                    this._usuario = {
                        uid: resp.uid,
                        email: resp.email,
                        name: resp.name,
                        apellido: resp.apellido,
                        rol: resp.rol,
                        tenant_id: resp.tenant_id,
                    };
                }
            }),
            map(resp => resp.ok),
            catchError(() => of(false))
        );
    }

    validarToken(): Observable<boolean> {
        const url = `${this.baseUrl}/auth/renew`;
        return this.http.get<RenewResponse>(url).pipe(
            tap(resp => {
                if (resp.ok) {
                    this.guardarToken(resp.token);
                    this._usuario = {
                        uid: resp.uid,
                        email: resp.email,
                        name: resp.name,
                        apellido: resp.apellido,
                        rol: resp.rol,
                        tenant_id: resp.tenant_id,
                    };
                }
            }),
            map(resp => resp.ok),
            catchError(() => of(false))
        );
    }

    logout(): void {
        localStorage.removeItem('x-token');
    }
}
