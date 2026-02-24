import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

/**
 * AuthInterceptor — Centralizes token injection and session expiry handling.
 *
 * Every outgoing HTTP request automatically gets the `x-token` header
 * attached (if a token exists in localStorage).
 *
 * On 401 responses, the token is cleared and the user is redirected to auth.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private router: Router) { }

    intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const token = localStorage.getItem('x-token');

        // Clone request and attach token if available
        const authReq = token
            ? req.clone({ setHeaders: { 'x-token': token } })
            : req;

        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                // 401 = unauthorized / expired token → force logout
                if (error.status === 401) {
                    localStorage.removeItem('x-token');
                    this.router.navigateByUrl('/auth');
                }
                return throwError(() => error);
            })
        );
    }
}
