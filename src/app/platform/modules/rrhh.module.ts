import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';
import { SharedModule } from '../../shared/shared.module';

import { EmpleadosComponent } from '../pages/empleados/empleados.component';
import { EmpleadoComponent } from '../pages/empleado/empleado.component';
import { AgregarEmpleadoComponent } from '../pages/agregar-empleado/agregar-empleado.component';
import { ClientesComponent } from '../pages/clientes/clientes.component';
import { ClienteComponent } from '../pages/cliente/cliente.component';
import { AgregarClienteComponent } from '../pages/agregar-cliente/agregar-cliente.component';

const routes: Routes = [
    { path: 'empleados', component: EmpleadosComponent },
    { path: 'empleado/:id', component: EmpleadoComponent },
    { path: 'agregar-empleado', component: AgregarEmpleadoComponent },
    { path: 'editar-empleado/:id', component: AgregarEmpleadoComponent },
    { path: 'clientes', component: ClientesComponent },
    { path: 'cliente/:id', component: ClienteComponent },
    { path: 'agregar-cliente', component: AgregarClienteComponent },
    { path: 'editar-cliente/:id', component: AgregarClienteComponent },
];

@NgModule({
    declarations: [
        EmpleadosComponent,
        EmpleadoComponent,
        AgregarEmpleadoComponent,
        ClientesComponent,
        ClienteComponent,
        AgregarClienteComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        SharedModule,
    ],
})
export class RrhhModule { }
