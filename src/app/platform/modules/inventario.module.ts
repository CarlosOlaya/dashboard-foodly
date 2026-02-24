import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';

import { ProductosComponent } from '../pages/productos/productos.component';
import { AgregarProductoComponent } from '../pages/agregar-producto/agregar-producto.component';
import { ProveedoresComponent } from '../pages/proveedores/proveedores.component';
import { ProveedorComponent } from '../pages/proveedor/proveedor.component';
import { AgregarProveedorComponent } from '../pages/agregar-proveedor/agregar-proveedor.component';

const routes: Routes = [
    { path: 'productos', component: ProductosComponent },
    { path: 'agregar-producto', component: AgregarProductoComponent },
    { path: 'editar-producto/:id', component: AgregarProductoComponent },
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
    ],
})
export class InventarioModule { }
