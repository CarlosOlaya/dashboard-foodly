import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';
import { SharedModule } from '../../shared/shared.module';

import { CartaComponent } from '../pages/carta/carta.component';
import { AgregarPlatoComponent } from '../pages/agregar-plato/agregar-plato.component';
import { PlatoComponent } from '../pages/plato/plato.component';
import { CategoriasDialogComponent } from '../pages/categorias-dialog/categorias-dialog.component';

const routes: Routes = [
    { path: 'carta', component: CartaComponent },
    { path: 'agregar-plato', component: AgregarPlatoComponent },
    { path: 'editar-plato/:id', component: AgregarPlatoComponent },
];

@NgModule({
    declarations: [
        CartaComponent,
        AgregarPlatoComponent,
        PlatoComponent,
        CategoriasDialogComponent,
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
export class CartaModule { }
