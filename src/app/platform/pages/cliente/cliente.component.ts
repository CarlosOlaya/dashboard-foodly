import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../../shared/interfaces';
import { PlatformService } from '../../services/platform.service';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent implements OnInit {

  cliente!: Cliente;
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
          return this.platformService.getCliente(this.id);
        })
      )
      .subscribe(cliente => {
        this.cliente = cliente;
      });
  }

  editar(): void {
    this.router.navigateByUrl('/home/editar-cliente/' + this.id);
  }

  async eliminar(): Promise<void> {
    if (!await this.alert.confirm('¿Estás seguro de eliminar este cliente?', 'Sí, eliminar')) return;
    this.platformService.eliminarCliente(this.id).subscribe(resp => {
      this.alert.success(resp.mensaje);
      this.router.navigateByUrl('/home/clientes');
    });
  }
}
