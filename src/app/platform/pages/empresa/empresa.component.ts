import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlatformService } from '../../services/platform.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Tenant } from '../../../shared/interfaces';
import { AlertService } from '../../services/alert.service';

@Component({
    selector: 'app-empresa',
    templateUrl: './empresa.component.html',
    styleUrls: ['./empresa.component.css']
})
export class EmpresaComponent implements OnInit {

    empresa!: Tenant;
    formulario!: FormGroup;
    editando = false;
    subiendoLogo = false;
    logoPreview: string | null = null;

    get isAdmin(): boolean {
        return this.authService.isAdmin;
    }

    constructor(
        private fb: FormBuilder,
        private platformService: PlatformService,
        private authService: AuthService,
        private alert: AlertService,
    ) { }

    ngOnInit(): void {
        this.cargarEmpresa();
    }

    cargarEmpresa(): void {
        this.platformService.getEmpresa().subscribe(empresa => {
            this.empresa = empresa;
            this.initForm(empresa);
        });
    }

    private initForm(e: Tenant): void {
        this.formulario = this.fb.group({
            nombre: [e.nombre, [Validators.required, Validators.minLength(2)]],
            nit: [e.nit || ''],
            direccion: [e.direccion || ''],
            telefono: [e.telefono || ''],
            email: [e.email || ''],
            logo_url: [e.logo_url || ''],
            color_primario: [e.color_primario],
            color_secundario: [e.color_secundario],
            color_acento: [e.color_acento],
            moneda: [e.moneda],
            porcentaje_iva: [e.porcentaje_iva, [Validators.min(0), Validators.max(100)]],
            porcentaje_servicio: [e.porcentaje_servicio, [Validators.min(0), Validators.max(100)]],
            zona_horaria: [e.zona_horaria],
            prefijo_factura: [e.prefijo_factura],
            resolucion_dian: [e.resolucion_dian || ''],
            rango_factura_inicio: [e.rango_factura_inicio],
            rango_factura_fin: [e.rango_factura_fin],
        });
    }

    toggleEditar(): void {
        this.editando = !this.editando;
        if (!this.editando && this.empresa) {
            this.initForm(this.empresa);
        }
    }

    guardar(): void {
        if (this.formulario.invalid) return;

        const data = this.formulario.value;
        this.platformService.actualizarEmpresa(data).subscribe({
            next: (empresa) => {
                this.empresa = empresa;
                this.editando = false;
                this.alert.success('Datos de la empresa actualizados');
            },
            error: () => {
                this.alert.error('Error al actualizar los datos');
            }
        });
    }

    // ══════════════════════════════════════════════
    // LOGO UPLOAD
    // ══════════════════════════════════════════════
    onLogoFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;
        const file = input.files[0];

        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.alert.warning('La imagen no debe superar 5MB');
            return;
        }

        // Preview local
        const reader = new FileReader();
        reader.onload = () => { this.logoPreview = reader.result as string; };
        reader.readAsDataURL(file);

        // Subir a Cloudinary
        this.subiendoLogo = true;
        this.platformService.subirImagen(file, 'logo').subscribe({
            next: (resp) => {
                this.subiendoLogo = false;
                this.logoPreview = null;
                // Guardar la URL en la empresa
                this.platformService.actualizarEmpresa({ logo_url: resp.url }).subscribe({
                    next: (empresa) => {
                        this.empresa = empresa;
                        this.formulario?.patchValue({ logo_url: resp.url });
                        this.alert.success('Logo actualizado', 1200);
                    }
                });
            },
            error: (err) => {
                this.subiendoLogo = false;
                this.logoPreview = null;
                this.alert.error('Error al subir el logo: ' + (err?.error?.message || 'Error desconocido'));
            }
        });
    }

    async eliminarLogo(): Promise<void> {
        if (!await this.alert.confirm('El logo se quitará de la empresa', 'Sí, eliminar')) return;
        this.platformService.actualizarEmpresa({ logo_url: '' }).subscribe({
            next: (empresa) => {
                this.empresa = empresa;
                this.formulario?.patchValue({ logo_url: '' });
                this.alert.success('Logo eliminado', 1000);
            }
        });
    }

    copiarId(): void {
        navigator.clipboard.writeText(this.empresa.id).then(() => {
            this.alert.success('Tenant ID copiado al portapapeles', 800);
        });
    }

    async cambiarPlan(nuevoPlan: string): Promise<void> {
        if (nuevoPlan === this.empresa.plan) return;

        const nombres: Record<string, string> = {
            basico: 'Básico',
            profesional: 'Profesional',
            empresarial: 'Empresarial'
        };
        const mesasPorPlan: Record<string, number> = {
            basico: 5,
            profesional: 20,
            empresarial: 30
        };

        const esDowngrade = mesasPorPlan[nuevoPlan] < mesasPorPlan[this.empresa.plan];

        const result = await this.alert.fire({
            title: `Cambiar a plan ${nombres[nuevoPlan]}`,
            html: esDowngrade
                ? `<p>Al bajar de plan, las mesas adicionales serán desactivadas.</p><p><b>Mesas incluidas:</b> ${mesasPorPlan[nuevoPlan]}</p>`
                : `<p>Se crearán mesas adicionales automáticamente.</p><p><b>Mesas incluidas:</b> ${mesasPorPlan[nuevoPlan]}</p>`,
            icon: esDowngrade ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonText: 'Confirmar cambio',
            cancelButtonText: 'Cancelar',
        });
        if (result.isConfirmed) {
            this.platformService.cambiarPlan(nuevoPlan).subscribe({
                next: (resp) => {
                    this.cargarEmpresa();
                    if (resp.ok) this.alert.success(resp.mensaje, 2500);
                    else this.alert.info(resp.mensaje, 2500);
                },
                error: () => {
                    this.alert.error('Error al cambiar el plan');
                }
            });
        }
    }
}
