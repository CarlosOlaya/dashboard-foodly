import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';
import { SharedModule } from '../../shared/shared.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { FacturacionComponent } from '../pages/facturacion/facturacion.component';
import { FacturaComponent } from '../pages/factura/factura.component';
import { DetalleFacturaComponent } from '../pages/detalle-factura/detalle-factura.component';
import { GastosComponent } from '../pages/gastos/gastos.component';
import { ArqueoComponent } from '../pages/arqueo/arqueo.component';

import { adminGuard } from '../../guards/admin.guard';

const routes: Routes = [
    { path: 'facturacion', component: FacturacionComponent },
    { path: 'factura/:id', component: FacturaComponent },
    { path: 'gastos', component: GastosComponent, canActivate: [adminGuard] },
    { path: 'arqueo', component: ArqueoComponent, canActivate: [adminGuard] },
];

@NgModule({
    declarations: [
        FacturacionComponent,
        FacturaComponent,
        DetalleFacturaComponent,
        GastosComponent,
        ArqueoComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        NgxChartsModule,
        SharedModule,
    ],
})
export class FinanzasModule { }
