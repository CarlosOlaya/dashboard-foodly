import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../../platform/services/alert.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {

    registerForm: FormGroup;
    errorMsg = '';
    loading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private alert: AlertService,
    ) {
        this.registerForm = this.fb.group({
            tenant_id: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],
        });
    }

    get passwordMismatch(): boolean {
        const { password, confirmPassword } = this.registerForm.value;
        return password && confirmPassword && password !== confirmPassword;
    }

    register(): void {
        if (this.registerForm.invalid || this.passwordMismatch) return;
        this.loading = true;
        this.errorMsg = '';

        const { tenant_id, email, password } = this.registerForm.value;

        this.authService.register(tenant_id, email, password).subscribe(ok => {
            this.loading = false;
            if (ok) {
                this.alert.fire({
                    icon: 'success',
                    title: '¡Cuenta creada!',
                    text: 'Tu registro fue exitoso. Bienvenido al equipo.',
                    timer: 2000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                    didClose: () => {
                        this.router.navigateByUrl('/home');
                    }
                });
            } else {
                this.alert.fire({
                    icon: 'error',
                    title: 'Registro fallido',
                    text: 'No se pudo completar el registro. Verifica que tu email esté registrado como empleado.',
                    confirmButtonText: 'Entendido',
                });
            }
        });
    }
}
