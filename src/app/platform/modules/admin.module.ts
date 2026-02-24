import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';

import { EmpresaComponent } from '../pages/empresa/empresa.component';
import { NominaComponent } from '../pages/nomina/nomina.component';

const routes: Routes = [
    { path: 'empresa', component: EmpresaComponent },
    { path: 'nomina', component: NominaComponent },
];

@NgModule({
    declarations: [
        EmpresaComponent,
        NominaComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
    ],
})
export class AdminModule { }
