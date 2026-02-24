import { Component, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-detalle-factura',
  templateUrl: './detalle-factura.component.html',
  styleUrl: './detalle-factura.component.css'
})
export class DetalleFacturaComponent {
  @Input() dataSourceFactura: MatTableDataSource<any> = new MatTableDataSource<any>();
  @Input() displayedColumnsFactura: string[] = ['plato', 'precio', 'cantidad', 'total'];
}
