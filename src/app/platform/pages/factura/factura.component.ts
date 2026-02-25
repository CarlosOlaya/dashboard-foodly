import { Component, OnInit } from '@angular/core';
import { PlatformService } from '../../services/platform.service';
import { Factura, DetalleFactura } from '../../../shared/interfaces';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.css']
})
export class FacturaComponent implements OnInit {

  displayedColumnsFactura: string[] = ['plato', 'precio', 'cantidad', 'total'];
  dataSourceFactura = new MatTableDataSource<DetalleFactura>();
  facturaId = '';
  factura!: Factura;

  constructor(
    private platformService: PlatformService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alert: AlertService,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        switchMap(({ id }) => {
          this.facturaId = id;
          return this.platformService.getFactura(this.facturaId);
        })
      )
      .subscribe(factura => {
        this.factura = factura;
        if (factura.detalles) {
          this.dataSourceFactura.data = factura.detalles;
        }
      });
  }

  get meseroNombre(): string {
    if (!this.factura?.empleado) return '';
    return `${this.factura.empleado.nombre} ${this.factura.empleado.apellido1}`;
  }

  get clienteNombre(): string {
    if (!this.factura?.cliente) return 'General';
    return `${this.factura.cliente.nombre} ${this.factura.cliente.apellido1}`;
  }

  async anularFactura(): Promise<void> {
    if (this.factura.estado !== 'cerrada') return;
    const result = await this.alert.fire({
      title: 'Anular factura',
      text: `¿Anular ${this.factura.numero_factura}? Esta acción la quita del cuadre financiero.`,
      input: 'textarea',
      inputPlaceholder: 'Motivo de anulación...',
      showCancelButton: true,
      confirmButtonText: 'Anular',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    });
    if (result.isConfirmed && result.value) {
      this.platformService.anularFactura(this.facturaId, result.value).subscribe(resp => {
        if (this.alert.handleResponse(resp)) this.router.navigateByUrl('/home/facturacion');
      });
    }
  }

  reabrirFactura(): void {
    if (this.factura.estado !== 'cerrada') return;

    this.platformService.getMesas().subscribe(mesas => {
      const mesasLibres = mesas.filter(m => m.estado === 'libre');

      if (mesasLibres.length === 0) {
        this.alert.warning('No hay mesas libres disponibles.');
        return;
      }

      const opciones: Record<string, string> = {};
      mesasLibres.forEach(m => { opciones[m.id] = `Mesa ${m.numero}`; });

      this.alert.fire({
        title: 'Reabrir cuenta',
        text: `Se reabrirá ${this.factura.numero_factura || 'esta cuenta'} y se revertirá el pago. Selecciona la mesa:`,
        input: 'select',
        inputOptions: opciones,
        inputPlaceholder: 'Selecciona una mesa...',
        showCancelButton: true,
        confirmButtonText: 'Reabrir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#f59e0b',
        inputValidator: (value) => {
          if (!value) return 'Debes seleccionar una mesa';
          return null;
        }
      }).then(result => {
        if (result.isConfirmed && result.value) {
          this.platformService.reabrirFactura(this.facturaId, result.value).subscribe({
            next: (resp) => {
              if (this.alert.handleResponse(resp)) this.router.navigateByUrl('/home/mesas');
            },
            error: (err) => {
              this.alert.error(err?.error?.message || 'No se pudo reabrir');
            }
          });
        }
      });
    });
  }
}