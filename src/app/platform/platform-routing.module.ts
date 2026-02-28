import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { MesasComponent } from './pages/mesas/mesas.component';
import { ServicioComponent } from './pages/servicio/servicio.component';
import { ComandasComponent } from './pages/comandas/comandas.component';
import { PrintComponent } from './impresiones/print/print.component';
import { adminGuard } from '../guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      // ── Core (eager – always needed) ──────────────────
      { path: 'mesas', component: MesasComponent },
      { path: 'servicio_mesa/:id', component: ServicioComponent },
      { path: 'comandas', component: ComandasComponent },
      { path: 'print/:pedido/:nombreImpresora', component: PrintComponent },

      // ── Carta (lazy) ──────────────────────────────────
      {
        path: '',
        canActivate: [adminGuard],
        loadChildren: () => import('./modules/carta.module').then(m => m.CartaModule),
      },

      // ── RRHH (lazy) ───────────────────────────────────
      {
        path: '',
        canActivate: [adminGuard],
        loadChildren: () => import('./modules/rrhh.module').then(m => m.RrhhModule),
      },

      // ── Finanzas (lazy) ───────────────────────────────
      {
        path: '',
        loadChildren: () => import('./modules/finanzas.module').then(m => m.FinanzasModule),
      },

      // ── Inventario (lazy) ─────────────────────────────
      {
        path: '',
        canActivate: [adminGuard],
        loadChildren: () => import('./modules/inventario.module').then(m => m.InventarioModule),
      },

      // ── Admin (lazy) ──────────────────────────────────
      {
        path: '',
        canActivate: [adminGuard],
        loadChildren: () => import('./modules/admin.module').then(m => m.AdminModule),
      },

      // ── Reportes (lazy) ────────────────────────────────
      {
        path: '',
        canActivate: [adminGuard],
        loadChildren: () => import('./modules/reportes.module').then(m => m.ReportesModule),
      },

      { path: '**', redirectTo: 'mesas' },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlatformRoutingModule { }
