import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { PlatformService } from '../../services/platform.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Empleado } from '../../../shared/interfaces';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css']
})
export class EmpleadosComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['nombre', 'apellido1', 'documento', 'email', 'telefono', 'cargo'];
  dataSource = new MatTableDataSource<Empleado>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  constructor(
    private platformService: PlatformService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarEmpleados(): void {
    this.platformService.getEmpleados().subscribe({
      next: emp => { this.dataSource.data = emp; }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  empleadoSel(row: Empleado): void {
    this.router.navigateByUrl('/home/empleado/' + row.id);
  }
}