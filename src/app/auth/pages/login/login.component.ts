import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../../platform/services/alert.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {

    loginForm: FormGroup;
    errorMsg = '';
    loading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private alert: AlertService,
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(4)]]
        });
    }

    login(): void {
        if (this.loginForm.invalid) return;
        this.loading = true;
        this.errorMsg = '';

        const { email, password } = this.loginForm.value;

        this.authService.login(email, password).subscribe(result => {
            this.loading = false;
            if (result === 'ok') {
                const nombre = this.authService.usuario?.name || '';
                this.alert.fire({
                    icon: 'success',
                    title: `¡Bienvenido${nombre ? ', ' + nombre : ''}!`,
                    text: 'Sesión iniciada correctamente',
                    timer: 800,
                    showConfirmButton: false,
                    timerProgressBar: true,
                    didClose: () => {
                        this.router.navigateByUrl('/home');
                    }
                });
            } else if (result === 'connection_error') {
                this.alert.fire({
                    icon: 'warning',
                    title: 'Servidor no disponible',
                    html: `
                        <div style="text-align:center;">
                            <p style="color:#64748b; font-size:14px; margin-bottom:8px;">No se pudo conectar con el servidor.</p>
                            <div style="background:#fef2f2; border:1px solid rgba(220,38,38,0.15); border-radius:10px; padding:12px; font-size:13px; color:#dc2626;">
                                <strong>ERR_CONNECTION_REFUSED</strong><br>
                                Verifica que la API esté en ejecución
                            </div>
                        </div>
                    `,
                    confirmButtonText: 'Reintentar',
                    confirmButtonColor: '#0891B2',
                });
            } else {
                this.alert.fire({
                    icon: 'error',
                    title: 'Error de autenticación',
                    text: 'Credenciales incorrectas. Verifica tu email y contraseña.',
                    confirmButtonText: 'Reintentar',
                });
            }
        });
    }
}
