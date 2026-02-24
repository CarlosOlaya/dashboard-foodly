import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlatformRoutingModule } from './platform-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';

// Core components — always loaded
import { HomeComponent } from './pages/home/home.component';
import { MesasComponent } from './pages/mesas/mesas.component';
import { ServicioComponent } from './pages/servicio/servicio.component';
import { CobroPanelComponent } from './pages/servicio/cobro-panel/cobro-panel.component';
import { ComandasComponent } from './pages/comandas/comandas.component';
import { PrintComponent } from './impresiones/print/print.component';
import { ImagenPipe } from './pipes/imagen.pipe';

@NgModule({
  declarations: [
    // Core — eagerly loaded
    HomeComponent,
    MesasComponent,
    ServicioComponent,
    CobroPanelComponent,
    ComandasComponent,
    PrintComponent,
    ImagenPipe,
  ],
  imports: [
    CommonModule,
    PlatformRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    FormsModule,
  ]
})
export class PlatformModule { }
