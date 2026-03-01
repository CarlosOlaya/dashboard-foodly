import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ValidacionesService } from '../../../auth/services/validaciones.service';
import { PlatformService } from '../../services/platform.service';
import { AlertService } from '../../services/alert.service';
import { environment } from '../../../../environments/environment';
import { switchMap } from 'rxjs';

interface RolOption {
  codigo: string;
  nombre: string;
  descripcion: string;
}

@Component({
  selector: 'app-agregar-empleado',
  templateUrl: './agregar-empleado.component.html',
  styleUrls: ['./agregar-empleado.component.css']
})
export class AgregarEmpleadoComponent implements OnInit {

  roles: RolOption[] = [];

  formulario: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    apellido1: ['', [Validators.required]],
    apellido2: [''],
    tipo_documento: [''],
    documento: [''],
    email: ['', [Validators.pattern(this.validacionesService.emailPattern)]],
    telefono: [''],
    cargo: ['', [Validators.required]],
    salario: [0],
    foto_url: [''],
  });

  id = '';
  isEditing = false;
  fotoPreview = '';
  subiendoFoto = false;
  private fotoCambiada = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private platformService: PlatformService,
    private validacionesService: ValidacionesService,
    private activatedRoute: ActivatedRoute,
    private alert: AlertService,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.loadRoles();

    if (this.router.url.includes('editar-empleado')) {
      this.isEditing = true;
      this.activatedRoute.params
        .pipe(switchMap(({ id }) => { this.id = id; return this.platformService.getEmpleado(id); }))
        .subscribe(empleado => {
          this.formulario.patchValue({
            nombre: empleado.nombre,
            apellido1: empleado.apellido1,
            apellido2: empleado.apellido2,
            tipo_documento: empleado.tipo_documento,
            documento: empleado.documento,
            email: empleado.email,
            telefono: empleado.telefono,
            cargo: empleado.cargo,
            salario: empleado.salario,
            foto_url: empleado.foto_url || '',
          });
          this.fotoPreview = empleado.foto_url || '';
        });
    }

    // Keep preview in sync with form control
    this.fotoPreview = this.formulario.get('foto_url')?.value || '';
    this.formulario.get('foto_url')?.valueChanges.subscribe(value => {
      this.fotoPreview = value || '';
    });
  }

  private loadRoles(): void {
    this.http.get<RolOption[]>(`${environment.baseUrl}/auth/roles`)
      .subscribe({
        next: (roles) => { this.roles = roles; },
        error: () => {
          this.roles = [
            { codigo: 'admin', nombre: 'Administrador', descripcion: '' },
            { codigo: 'cajero', nombre: 'Cajero', descripcion: '' },
            { codigo: 'mesero', nombre: 'Mesero', descripcion: '' },
            { codigo: 'cocinero', nombre: 'Cocinero', descripcion: '' },
            { codigo: 'bartender', nombre: 'Bartender', descripcion: '' },
          ];
        }
      });
  }

  guardar(): void {
    const data = { ...this.formulario.value };
    data.salario = Number(data.salario) || 0;

    // Only include foto_url if the user actually uploaded a new photo
    if (!this.fotoCambiada) {
      delete data.foto_url;
    }

    if (!this.isEditing) {
      this.platformService.crearEmpleado(data).subscribe(() => {
        this.alert.success('Empleado creado correctamente');
        this.router.navigateByUrl('/home/empleados');
      });
    } else {
      this.platformService.actualizarEmpleado(this.id, data).subscribe(() => {
        this.alert.success('Empleado actualizado');
        this.router.navigateByUrl('/home/empleados');
      });
    }
  }

  async eliminar(): Promise<void> {
    if (!await this.alert.confirm('¿Estás seguro de eliminar este empleado?', 'Sí, eliminar')) return;
    this.platformService.eliminarEmpleado(this.id).subscribe(resp => {
      this.alert.success(resp.mensaje);
      this.router.navigateByUrl('/home/empleados');
    });
  }

  onFotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    // Local preview immediately
    const reader = new FileReader();
    reader.onload = () => this.fotoPreview = reader.result as string;
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    this.subiendoFoto = true;
    this.platformService.subirImagen(file, 'empleados').subscribe({
      next: (resp) => {
        this.formulario.get('foto_url')?.setValue(resp.url);
        this.fotoCambiada = true;
        this.subiendoFoto = false;
      },
      error: () => {
        this.subiendoFoto = false;
        this.alert.error('Error al subir la foto');
      }
    });
  }
}
