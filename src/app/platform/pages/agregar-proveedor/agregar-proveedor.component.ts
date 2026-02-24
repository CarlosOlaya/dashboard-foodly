import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { PlatformService } from '../../services/platform.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-agregar-proveedor',
  templateUrl: './agregar-proveedor.component.html',
  styleUrls: ['./agregar-proveedor.component.css']
})
export class AgregarProveedorComponent implements OnInit {

  formulario: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    nit: [''],
    telefono: [''],
    email: [''],
    nombre_asesor: [''],
    dia_entrega: [''],
    dia_pedido: [''],
    notas: [''],
  });

  id = '';
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private platformService: PlatformService,
    private activatedRoute: ActivatedRoute,
    private alert: AlertService,
  ) { }

  ngOnInit(): void {
    if (this.router.url.includes('editar-proveedor')) {
      this.isEditing = true;
      this.activatedRoute.params
        .pipe(switchMap(({ id }) => { this.id = id; return this.platformService.getProveedor(id); }))
        .subscribe(prov => {
          this.formulario.patchValue({
            nombre: prov.nombre,
            nit: prov.nit,
            telefono: prov.telefono,
            email: prov.email,
            nombre_asesor: prov.nombre_asesor,
            dia_entrega: prov.dia_entrega,
            dia_pedido: prov.dia_pedido,
            notas: prov.notas,
          });
        });
    }
  }

  guardar(): void {
    const data = this.formulario.value;
    if (!this.isEditing) {
      this.platformService.crearProveedor(data).subscribe(resp => {
        if (this.alert.handleResponse(resp)) this.router.navigateByUrl('/home/proveedores');
      });
    } else {
      this.platformService.actualizarProveedor(this.id, data).subscribe(() => {
        this.alert.success('Proveedor actualizado');
        this.router.navigateByUrl('/home/proveedores');
      });
    }
  }

  async eliminar(): Promise<void> {
    if (!await this.alert.confirm('¿Estás seguro de eliminar este proveedor?', 'Sí, eliminar')) return;
    this.platformService.eliminarProveedor(this.id).subscribe(resp => {
      this.alert.success(resp.mensaje);
      this.router.navigateByUrl('/home/proveedores');
    });
  }
}
