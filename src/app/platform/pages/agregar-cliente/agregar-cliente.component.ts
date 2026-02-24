import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlatformService } from '../../services/platform.service';
import { ValidacionesService } from '../../../auth/services/validaciones.service';
import { switchMap } from 'rxjs';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-agregar-cliente',
  templateUrl: './agregar-cliente.component.html',
  styleUrls: ['./agregar-cliente.component.css']
})
export class AgregarClienteComponent implements OnInit {

  formulario: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    apellido1: ['', [Validators.required]],
    apellido2: [''],
    documento: [''],
    email: ['', [Validators.pattern(this.validacionesService.emailPattern)]],
    telefono: [''],
    genero: [''],
    fecha_nacimiento: [''],
    notas: [''],
  });

  id = '';
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private platformService: PlatformService,
    private validacionesService: ValidacionesService,
    private activatedRoute: ActivatedRoute,
    private alert: AlertService,
  ) { }

  ngOnInit(): void {
    if (this.router.url.includes('editar-cliente')) {
      this.isEditing = true;
      this.activatedRoute.params
        .pipe(switchMap(({ id }) => { this.id = id; return this.platformService.getCliente(id); }))
        .subscribe(cliente => {
          this.formulario.patchValue({
            nombre: cliente.nombre,
            apellido1: cliente.apellido1,
            apellido2: cliente.apellido2,
            documento: cliente.documento,
            email: cliente.email,
            telefono: cliente.telefono,
            genero: cliente.genero,
            fecha_nacimiento: cliente.fecha_nacimiento,
            notas: cliente.notas,
          });
        });
    }
  }

  guardar(): void {
    const data = this.formulario.value;
    if (!this.isEditing) {
      this.platformService.crearCliente(data).subscribe(resp => {
        if (this.alert.handleResponse(resp)) this.router.navigateByUrl('/home/clientes');
      });
    } else {
      this.platformService.actualizarCliente(this.id, data).subscribe(() => {
        this.alert.success('Cliente actualizado');
        this.router.navigateByUrl('/home/clientes');
      });
    }
  }

  async eliminar(): Promise<void> {
    if (!await this.alert.confirm('¿Estás seguro de eliminar este cliente?', 'Sí, eliminar')) return;
    this.platformService.eliminarCliente(this.id).subscribe(resp => {
      this.alert.success(resp.mensaje);
      this.router.navigateByUrl('/home/clientes');
    });
  }
}
