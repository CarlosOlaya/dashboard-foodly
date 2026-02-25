import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { Proveedor } from '../../../shared/interfaces';
import { PlatformService } from '../../services/platform.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css']
})
export class ProveedoresComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['nombre', 'nit', 'telefono', 'email', 'dia_entrega', 'dia_pedido'];
  dataSource = new MatTableDataSource<Proveedor>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private platformService: PlatformService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarProveedores();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarProveedores(): void {
    this.platformService.getProveedores().subscribe({
      next: prov => { this.dataSource.data = prov; }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  proveedorSel(row: Proveedor): void {
    this.router.navigateByUrl('/home/proveedor/' + row.id);
  }
}
