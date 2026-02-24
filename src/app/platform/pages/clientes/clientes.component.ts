import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Cliente } from '../../../auth/interfaces/interfaces';
import { PlatformService } from '../../services/platform.service';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['nombre', 'apellido1', 'documento', 'email', 'telefono'];
  dataSource = new MatTableDataSource<Cliente>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private platformService: PlatformService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarClientes();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarClientes(): void {
    this.platformService.getClientes().subscribe({
      next: clientes => { this.dataSource.data = clientes; }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  clienteSel(row: Cliente): void {
    this.router.navigateByUrl('/home/cliente/' + row.id);
  }
}
