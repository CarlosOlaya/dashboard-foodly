import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';
import { SharedModule } from '../../shared/shared.module';
import { AuditoriaComponent } from '../pages/auditoria/auditoria.component';
import { adminGuard } from '../../guards/admin.guard';

const routes: Routes = [
    { path: 'auditoria', component: AuditoriaComponent, canActivate: [adminGuard] },
];

@NgModule({
    declarations: [AuditoriaComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        MaterialModule,
        SharedModule,
    ],
})
export class AuditoriaModule { }
