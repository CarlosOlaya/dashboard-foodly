import { Component, OnInit } from '@angular/core';
import { AnalyticsApiService } from '../../services/analytics-api.service';
import {
    AnalyticsReport, AnalyticsResumen, VentaDia, VentaHora,
    ProductoVendido, VentaCategoria, MetodoPagoItem,
    EmpleadoRendimiento, DescuentosData, PropinasData
} from '../../../shared/interfaces';

type TabId = 'resumen' | 'productos' | 'propinas' | 'empleados' | 'pagos' | 'descuentos' | 'horarios';

interface Tab { id: TabId; label: string; icon: string; }

@Component({
    selector: 'app-reportes',
    templateUrl: './reportes.component.html',
    styleUrls: ['./reportes.component.css'],
})
export class ReportesComponent implements OnInit {

    loading = true;
    activeTab: TabId = 'resumen';
    activePreset = 'mes';

    // Date range
    desde = '';
    hasta = '';

    // Data
    report!: AnalyticsReport;
    resumen!: AnalyticsResumen;
    ventasDia: VentaDia[] = [];
    ventasHora: VentaHora[] = [];
    productos: ProductoVendido[] = [];
    categorias: VentaCategoria[] = [];
    metodosPago: MetodoPagoItem[] = [];
    propinas!: PropinasData;
    empleados: EmpleadoRendimiento[] = [];
    descuentos!: DescuentosData;

    // Charts
    chartVentasDia: any[] = [];
    chartHoras: any[] = [];
    chartCategorias: any[] = [];
    chartMetodos: any[] = [];
    chartPropinasDia: any[] = [];
    chartTopPlatos: any[] = [];
    chartPropinasEmpleado: any[] = [];
    chartFacturasDia: any[] = [];

    colorScheme = {
        name: 'reportes', selectable: true, group: 'ordinal' as const,
        domain: ['#06f9f9', '#0d9488', '#14b8a6', '#22d3ee', '#38bdf8', '#67e8f9', '#a5f3fc']
    };
    pieColors = {
        name: 'reportesPie', selectable: true, group: 'ordinal' as const,
        domain: ['#06f9f9', '#14b8a6', '#f59e0b', '#8b5cf6', '#f43f5e', '#6366f1', '#0ea5e9', '#22d3ee']
    };
    barColors = {
        name: 'reportesBar', selectable: true, group: 'ordinal' as const,
        domain: ['#14b8a6']
    };

    tabs: Tab[] = [
        { id: 'resumen', label: 'Resumen', icon: 'dashboard' },
        { id: 'productos', label: 'Productos', icon: 'restaurant_menu' },
        { id: 'propinas', label: 'Propinas', icon: 'volunteer_activism' },
        { id: 'empleados', label: 'Empleados', icon: 'badge' },
        { id: 'pagos', label: 'Pagos', icon: 'payments' },
        { id: 'descuentos', label: 'Descuentos', icon: 'sell' },
        { id: 'horarios', label: 'Horarios', icon: 'schedule' },
    ];

    // Preset ranges
    presets = [
        { label: 'Hoy', value: 'hoy' },
        { label: 'Ayer', value: 'ayer' },
        { label: 'Última semana', value: 'semana' },
        { label: 'Este mes', value: 'mes' },
        { label: 'Mes anterior', value: 'mes_anterior' },
    ];

    constructor(private analyticsService: AnalyticsApiService) { }

    ngOnInit(): void {
        this.applyPreset('mes');
    }

    applyPreset(preset: string): void {
        this.activePreset = preset;
        const hoy = new Date();
        let desde: Date;
        let hasta: Date = new Date(hoy);

        switch (preset) {
            case 'hoy':
                desde = new Date(hoy);
                break;
            case 'ayer':
                desde = new Date(hoy);
                desde.setDate(desde.getDate() - 1);
                hasta = new Date(desde);
                break;
            case 'semana':
                desde = new Date(hoy);
                desde.setDate(desde.getDate() - 6);
                break;
            case 'mes':
                desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                break;
            case 'mes_anterior':
                desde = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
                hasta = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
                break;
            default:
                desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        }

        this.desde = this.toISO(desde);
        this.hasta = this.toISO(hasta);
        this.loadData();
    }

    onDateChange(): void {
        if (this.desde && this.hasta) {
            this.loadData();
        }
    }

    loadData(): void {
        this.loading = true;
        this.analyticsService.getReporteCompleto(this.desde, this.hasta).subscribe({
            next: (data) => {
                this.report = data;
                this.resumen = data.resumen;
                this.ventasDia = data.ventas_por_dia;
                this.ventasHora = data.ventas_por_hora;
                this.productos = data.productos;
                this.categorias = data.categorias;
                this.metodosPago = data.metodos_pago;
                this.propinas = data.propinas;
                this.empleados = data.empleados;
                this.descuentos = data.descuentos;
                this.buildCharts();
                this.loading = false;
            },
            error: () => { this.loading = false; }
        });
    }

    buildCharts(): void {
        // Ventas por día (line)
        this.chartVentasDia = [{
            name: 'Ventas',
            series: this.ventasDia.map(v => ({
                name: this.formatFecha(v.fecha),
                value: v.total,
            }))
        }];

        // Facturas por día (line, secondary series)
        this.chartFacturasDia = [{
            name: 'Facturas',
            series: this.ventasDia.map(v => ({
                name: this.formatFecha(v.fecha),
                value: v.facturas,
            }))
        }];

        // Ventas por hora (bar)
        this.chartHoras = this.ventasHora.map(h => ({
            name: `${String(h.hora).padStart(2, '0')}:00`,
            value: h.total,
        }));

        // Top 10 platos (horizontal bar)
        this.chartTopPlatos = this.productos.slice(0, 10).map(p => ({
            name: p.nombre.length > 20 ? p.nombre.slice(0, 20) + '…' : p.nombre,
            value: p.cantidad,
        }));

        // Categorías (pie)
        this.chartCategorias = this.categorias.map(c => ({
            name: c.categoria,
            value: c.total,
        }));

        // Métodos de pago (pie)
        this.chartMetodos = this.metodosPago.map(m => ({
            name: this.capitalizarMetodo(m.metodo),
            value: m.total,
        }));

        // Propinas por día (line)
        this.chartPropinasDia = [{
            name: 'Propinas',
            series: (this.propinas?.por_dia || []).map(p => ({
                name: this.formatFecha(p.fecha),
                value: p.propinas,
            })),
        }];

        // Propinas por empleado (pie)
        this.chartPropinasEmpleado = (this.propinas?.por_empleado || []).map(e => ({
            name: e.empleado,
            value: e.propinas,
        }));
    }

    // ── Formatters ──
    formatCurrency(value: number): string {
        return '$' + (value || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    axisFormat = (val: number) => {
        if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
        if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
        return `$${val}`;
    };

    formatFecha(fecha: string): string {
        if (!fecha) return '';
        const d = new Date(fecha);
        return `${d.getDate()}/${d.getMonth() + 1}`;
    }

    capitalizarMetodo(metodo: string): string {
        const map: Record<string, string> = {
            efectivo: 'Efectivo', tarjeta: 'Tarjeta', transferencia: 'Transferencia',
            nequi: 'Nequi', daviplata: 'Daviplata', mixto: 'Mixto',
        };
        return map[metodo] || metodo;
    }

    // Utility
    private toISO(d: Date): string {
        return d.toISOString().slice(0, 10);
    }
}
