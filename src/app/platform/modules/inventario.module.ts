import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';
import { SharedModule } from '../../shared/shared.module';

import { ProductosComponent } from '../pages/inventario/inventario.component';
import { AgregarProductoComponent } from '../pages/agregar-insumo/agregar-insumo.component';
import { ProveedoresComponent } from '../pages/proveedores/proveedores.component';
import { ProveedorComponent } from '../pages/proveedor/proveedor.component';
import { AgregarProveedorComponent } from '../pages/agregar-proveedor/agregar-proveedor.component';

const routes: Routes = [
    { path: 'inventario', component: ProductosComponent },
    { path: 'agregar-insumo', component: AgregarProductoComponent },
    { path: 'editar-insumo/:id', component: AgregarProductoComponent },
    { path: 'proveedores', component: ProveedoresComponent },
    { path: 'proveedor/:id', component: ProveedorComponent },
    { path: 'agregar-proveedor', component: AgregarProveedorComponent },
    { path: 'editar-proveedor/:id', component: AgregarProveedorComponent },
];

@NgModule({
    declarations: [
        ProductosComponent,
        AgregarProductoComponent,
        ProveedoresComponent,
        ProveedorComponent,
        AgregarProveedorComponent,
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
export class InventarioModule { }
