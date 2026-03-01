import { Component } from '@angular/core';

interface Feature {
    icon: string;
    title: string;
    description: string;
}

@Component({
    selector: 'app-landing-features',
    templateUrl: './landing-features.component.html',
    styleUrls: ['./landing-features.component.css']
})
export class LandingFeaturesComponent {

    features: Feature[] = [
        {
            icon: 'receipt_long',
            title: 'Comandas en vivo',
            description: 'Gestiona pedidos en tiempo real. Envía comandas directamente a cocina y barra con un clic.'
        },
        {
            icon: 'table_restaurant',
            title: 'Gestión de mesas',
            description: 'Visualiza tus mesas en tiempo real. Asigna clientes, transfiere cuentas y controla la ocupación.'
        },
        {
            icon: 'description',
            title: 'Facturación completa',
            description: 'Genera facturas profesionales, aplica descuentos e impuestos automáticamente. Exporta a PDF.'
        },
        {
            icon: 'inventory_2',
            title: 'Inventario inteligente',
            description: 'Controla tu stock de productos con alertas de bajo inventario y gestión de proveedores.'
        },
        {
            icon: 'bar_chart',
            title: 'Reportes y analytics',
            description: 'Dashboards con KPIs, ventas diarias, platos más vendidos y métodos de pago.'
        },
        {
            icon: 'groups',
            title: 'Nómina y RRHH',
            description: 'Administra empleados, calcula nóminas y gestiona el talento de tu equipo.'
        },
    ];
}
