import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Servicio base que proporciona la URL del servidor.
 *
 * El token de autenticación se inyecta automáticamente
 * a todas las peticiones HTTP vía AuthInterceptor.
 *
 * Todos los servicios de dominio extienden esta clase.
 */
@Injectable({ providedIn: 'root' })
export class ApiBaseService {

    protected readonly baseUrl = environment.baseUrl;

    constructor(protected readonly http: HttpClient) { }
}
