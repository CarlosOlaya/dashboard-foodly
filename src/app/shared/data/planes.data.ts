/**
 * ═══════════════════════════════════════════════════════════════
 *  PLANES — Single Source of Truth
 *  ─────────────────────────────────────────────────────────────
 *  Consumed by:
 *    • OnboardComponent  (auth/pages/onboard)
 *    • PricingComponent   (landing/components/pricing)
 *
 *  🔑 Change prices / features HERE ONLY — they propagate everywhere.
 * ═══════════════════════════════════════════════════════════════
 */
import { Plan } from '../interfaces/plan.interface';

export const PLANES: Plan[] = [
    {
        id: 'basico',
        nombre: 'Básico',
        precio: '$49.900',
        periodo: '/mes',
        destacado: false,
        cta: 'Comienza gratis',
        icon: 'rocket_launch',
        features: [
            'Hasta 15 mesas',
            '3 usuarios',
            'Gestión de productos',
            'Control de inventario',
            'Reportes y estadísticas',
            'Monitoreo de KPIs',
            'Facturación básica',
            'Soporte por email',
        ]
    },
    {
        id: 'profesional',
        nombre: 'Profesional',
        precio: '$99.900',
        periodo: '/mes',
        destacado: true,
        cta: 'Elegir Profesional',
        icon: 'star',
        features: [
            'Todo lo del plan Básico',
            'Hasta 30 mesas',
            'Usuarios ilimitados',
            'Carta digital + QR',
            'Facturación electrónica',
            'Reportes avanzados',
            'Soporte por email',
        ]
    },
    {
        id: 'empresarial',
        nombre: 'Empresarial',
        precio: '$199.900',
        periodo: '/mes',
        destacado: false,
        cta: 'Contáctanos',
        icon: 'domain',
        features: [
            'Todo lo del plan Profesional',
            'Mesas ilimitadas',
            'Multi-sede',
            'Facturación DIAN',
            'API abierta',
            'Soporte prioritario 24/7',
        ]
    }
];
