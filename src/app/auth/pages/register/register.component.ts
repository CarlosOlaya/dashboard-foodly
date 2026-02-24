import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../../platform/services/alert.service';
import { environment } from '../../../../environments/environment';

interface RolOption {
    codigo: string;
    nombre: string;
    descripcion: string;
}

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

    registerForm: FormGroup;
    errorMsg = '';
    loading = false;
    roles: RolOption[] = [];

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private alert: AlertService,
        private http: HttpClient,
    ) {
        this.registerForm = this.fb.group({
            tenant_id: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],
            rol: ['mesero', [Validators.required]],
        });
    }

    ngOnInit(): void {
        this.loadRoles();
    }

    private loadRoles(): void {
        this.http.get<RolOption[]>(`${environment.baseUrl}/auth/roles`)
            .subscribe({
                next: (roles) => {
                    // Filter out admin — only admin can assign admin role
                    this.roles = roles.filter(r => r.codigo !== 'admin');
                },
                error: () => {
                    // Fallback if API fails
                    this.roles = [
                        { codigo: 'mesero', nombre: 'Mesero', descripcion: '' },
                        { codigo: 'cajero', nombre: 'Cajero', descripcion: '' },
                        { codigo: 'cocinero', nombre: 'Cocinero', descripcion: '' },
                        { codigo: 'bartender', nombre: 'Bartender', descripcion: '' },
                    ];
                }
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

        const { tenant_id, email, password, rol } = this.registerForm.value;

        this.authService.registerWithRole(tenant_id, email, password, rol).subscribe(ok => {
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
