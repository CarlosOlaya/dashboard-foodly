import { Component, OnInit } from '@angular/core';
import { Empleado } from '../../../auth/interfaces/interfaces';
import { PlatformService } from '../../services/platform.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-empleado',
  templateUrl: './empleado.component.html',
  styleUrls: ['./empleado.component.css']
})
export class EmpleadoComponent implements OnInit {

  empleado!: Empleado;
  id = '';

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  constructor(
    private platformService: PlatformService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alert: AlertService,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        switchMap(({ id }) => {
          this.id = id;
          return this.platformService.getEmpleado(this.id);
        })
      )
      .subscribe(empleado => {
        this.empleado = empleado;
      });
  }

  editar(): void {
    this.router.navigateByUrl('/home/editar-empleado/' + this.id);
  }

  async eliminar(): Promise<void> {
    if (!await this.alert.confirm('¿Estás seguro de eliminar este empleado?', 'Sí, eliminar')) return;
    this.platformService.eliminarEmpleado(this.id).subscribe(resp => {
      this.alert.success(resp.mensaje);
      this.router.navigateByUrl('/home/empleados');
    });
  }
}
