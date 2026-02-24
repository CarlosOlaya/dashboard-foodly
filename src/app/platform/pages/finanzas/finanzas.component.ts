import { Component, OnInit } from '@angular/core';
import { PlatformService } from '../../services/platform.service';

@Component({
  selector: 'app-finanzas',
  templateUrl: './finanzas.component.html',
  styleUrls: ['./finanzas.component.css']
})
export class FinanzasComponent implements OnInit {

  loading = true;

  // KPIs
  ventasHoy = 0;
  facturasHoy = 0;
  ventasMes = 0;
  facturasMes = 0;
  ticketPromedio = 0;
  propinasMes = 0;

  // Charts data
  ventasDiarias: any[] = [];
  topPlatos: any[] = [];
  porMetodoPago: any[] = [];

  // Chart options
  colorScheme: any = {
    domain: ['#22d3ee', '#14b8a6', '#06b6d4', '#0ea5e9', '#38bdf8', '#67e8f9']
  };
  pieColorScheme: any = {
    domain: ['#22d3ee', '#14b8a6', '#f59e0b', '#8b5cf6', '#f43f5e']
  };
  barColorScheme: any = {
    domain: ['#14b8a6']
  };

  constructor(private service: PlatformService) { }

  ngOnInit(): void {
    this.service.getDashboard().subscribe({
      next: (data) => {
        // KPIs
        this.ventasHoy = data.kpis.ventas_hoy;
        this.facturasHoy = data.kpis.facturas_hoy;
        this.ventasMes = data.kpis.ventas_mes;
        this.facturasMes = data.kpis.facturas_mes;
        this.ticketPromedio = data.kpis.ticket_promedio;
        this.propinasMes = data.kpis.propinas_mes;

        // Ventas diarias → line chart
        this.ventasDiarias = [{
          name: 'Ventas',
          series: data.ventas_diarias.map((v: any) => ({
            name: this.formatFecha(v.fecha),
            value: v.total
          }))
        }];

        // Top platos → horizontal bar chart
        this.topPlatos = data.top_platos.map((p: any) => ({
          name: p.nombre,
          value: p.cantidad
        }));

        // Método de pago → pie chart
        this.porMetodoPago = data.por_metodo_pago.map((m: any) => ({
          name: this.capitalizarMetodo(m.metodo),
          value: m.total
        }));

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  formatCurrency(value: number): string {
    return '$' + value.toLocaleString('es-CO', { minimumFractionDigits: 0 });
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }

  capitalizarMetodo(metodo: string): string {
    const map: Record<string, string> = {
      efectivo: 'Efectivo',
      tarjeta: 'Tarjeta',
      transferencia: 'Transferencia',
      mixto: 'Mixto',
      nequi: 'Nequi',
      daviplata: 'Daviplata',
    };
    return map[metodo] || metodo;
  }

  // Formatter for ngx-charts axis
  axisFormatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  pieLabel = (data: any) => {
    return `${data.data.name}`;
  };

  pieLabelValue = (data: any) => {
    return this.formatCurrency(data.value);
  };
}
