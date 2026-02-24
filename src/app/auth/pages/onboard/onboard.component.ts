import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../../platform/services/alert.service';

interface Plan {
    id: string;
    nombre: string;
    precio: string;
    periodo: string;
    destacado: boolean;
    features: string[];
}

@Component({
    selector: 'app-onboard',
    templateUrl: './onboard.component.html',
    styleUrls: ['./onboard.component.css']
})
export class OnboardComponent {

    step: 'planes' | 'formulario' = 'planes';
    selectedPlan = '';
    errorMsg = '';
    loading = false;

    planes: Plan[] = [
        {
            id: 'basico',
            nombre: 'Básico',
            precio: '$49.900',
            periodo: '/mes',
            destacado: false,
            features: [
                'Hasta 5 mesas',
                '1 usuario admin',
                'Facturación básica',
                'Carta digital',
                'Soporte por email',
            ]
        },
        {
            id: 'profesional',
            nombre: 'Profesional',
            precio: '$99.900',
            periodo: '/mes',
            destacado: true,
            features: [
                'Hasta 20 mesas',
                'Usuarios ilimitados',
                'Facturación electrónica',
                'Carta digital + QR',
                'Inventario básico',
                'Reportes y analytics',
                'Soporte prioritario',
            ]
        },
        {
            id: 'empresarial',
            nombre: 'Empresarial',
            precio: '$199.900',
            periodo: '/mes',
            destacado: false,
            features: [
                'Mesas ilimitadas',
                'Usuarios ilimitados',
                'Facturación DIAN',
                'Multi-sede',
                'Inventario avanzado',
                'Nómina integrada',
                'API abierta',
                'Soporte 24/7 dedicado',
            ]
        }
    ];

    empresaForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private alert: AlertService,
    ) {
        this.empresaForm = this.fb.group({
            nombre_restaurante: ['', [Validators.required, Validators.minLength(2)]],
            nit: [''],
            direccion: [''],
            telefono: [''],
            nombre_admin: ['', [Validators.required]],
            apellido_admin: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],
        });
    }

    get passwordMismatch(): boolean {
        const { password, confirmPassword } = this.empresaForm.value;
        return password && confirmPassword && password !== confirmPassword;
    }

    seleccionarPlan(planId: string): void {
        this.selectedPlan = planId;
        this.step = 'formulario';
    }

    volverAPlanes(): void {
        this.step = 'planes';
    }

    crearEmpresa(): void {
        if (this.empresaForm.invalid || this.passwordMismatch) return;
        this.loading = true;
        this.errorMsg = '';

        const formData = this.empresaForm.value;
        const data = {
            nombre_restaurante: formData.nombre_restaurante,
            nit: formData.nit || undefined,
            direccion: formData.direccion || undefined,
            telefono: formData.telefono || undefined,
            nombre_admin: formData.nombre_admin,
            apellido_admin: formData.apellido_admin,
            email: formData.email,
            password: formData.password,
            plan: this.selectedPlan,
        };

        this.authService.onboard(data).subscribe(ok => {
            this.loading = false;
            if (ok) {
                this.alert.fire({
                    icon: 'success',
                    title: '🎉 ¡Tu empresa está lista!',
                    html: `<b>${formData.nombre_restaurante}</b> ha sido creada exitosamente.<br>Ya puedes comenzar a gestionar tu restaurante.`,
                    confirmButtonText: 'Comenzar',
                }).then(() => {
                    this.router.navigateByUrl('/home');
                });
            } else {
                this.alert.fire({
                    icon: 'error',
                    title: 'No se pudo crear la empresa',
                    text: 'El email podría estar ya en uso. Por favor intenta con otro.',
                    confirmButtonText: 'Reintentar',
                });
            }
        });
    }
}
