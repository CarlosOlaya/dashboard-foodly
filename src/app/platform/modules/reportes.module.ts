import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';
import { SharedModule } from '../../shared/shared.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ReportesComponent } from '../pages/reportes/reportes.component';
import { adminGuard } from '../../guards/admin.guard';

const routes: Routes = [
    { path: 'reportes', component: ReportesComponent, canActivate: [adminGuard] },
];

@NgModule({
    declarations: [
        ReportesComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        MaterialModule,
        NgxChartsModule,
        SharedModule,
    ],
})
export class ReportesModule { }
