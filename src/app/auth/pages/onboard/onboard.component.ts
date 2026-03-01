import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../../platform/services/alert.service';
import { Plan } from '../../../shared/interfaces/plan.interface';
import { PLANES } from '../../../shared/data/planes.data';

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

    /** Centralized plan data — shared with Landing pricing section */
    planes: Plan[] = PLANES;


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
