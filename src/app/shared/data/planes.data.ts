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
            'Hasta 5 mesas',
            '1 usuario admin',
            'Facturación básica',
            'Carta digital',
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
            'Hasta 20 mesas',
            'Usuarios ilimitados',
            'Facturación electrónica',
            'Carta digital + QR',
            'Inventario básico',
            'Reportes y analytics',
            'Soporte prioritario',
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
            'Mesas ilimitadas',
            'Usuarios ilimitados',
            'Facturación DIAN',
            'Multi-sede',
            'Inventario avanzado',
            'Nómina integrada',
            'API abierta',
            'Soporte 24/7 dedicado',
        ]
    }
];
