import { Component, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DetalleFactura } from '../../../shared/interfaces';

@Component({
  selector: 'app-detalle-factura',
  templateUrl: './detalle-factura.component.html',
  styleUrl: './detalle-factura.component.css'
})
export class DetalleFacturaComponent {
  @Input() dataSourceFactura: MatTableDataSource<DetalleFactura> = new MatTableDataSource<DetalleFactura>();
  @Input() displayedColumnsFactura: string[] = ['plato', 'precio', 'cantidad', 'total'];
}
