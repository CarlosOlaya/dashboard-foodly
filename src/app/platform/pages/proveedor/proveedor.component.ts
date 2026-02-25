import { Component, OnInit } from '@angular/core';
import { Proveedor } from '../../../shared/interfaces';
import { PlatformService } from '../../services/platform.service';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.component.html',
  styleUrls: ['./proveedor.component.css']
})
export class ProveedorComponent implements OnInit {

  proveedor!: Proveedor;
  id = '';

  constructor(
    private platformService: PlatformService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alert: AlertService,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        switchMap(({ id }) => {
          this.id = id;
          return this.platformService.getProveedor(this.id);
        })
      )
      .subscribe(proveedor => {
        this.proveedor = proveedor;
      });
  }

  editar(): void {
    this.router.navigateByUrl('/home/editar-proveedor/' + this.id);
  }

  async eliminar(): Promise<void> {
    if (!await this.alert.confirm('¿Estás seguro de eliminar este proveedor?', 'Sí, eliminar')) return;
    this.platformService.eliminarProveedor(this.id).subscribe(resp => {
      this.alert.success(resp.mensaje);
      this.router.navigateByUrl('/home/proveedores');
    });
  }
}
