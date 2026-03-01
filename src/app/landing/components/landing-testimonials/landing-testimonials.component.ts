import { Component } from '@angular/core';

interface Testimonial {
    emoji: string;
    restaurant: string;
    quote: string;
    name: string;
    role: string;
    stars: number;
}

@Component({
    selector: 'app-landing-testimonials',
    templateUrl: './landing-testimonials.component.html',
    styleUrls: ['./landing-testimonials.component.css']
})
export class LandingTestimonialsComponent {

    testimonials: Testimonial[] = [
        {
            emoji: '🍕',
            restaurant: 'La Trattoria',
            quote: 'Foodly revolucionó nuestra operación. Pasamos de libretas de papel a comandas digitales en un día. El equipo de cocina lo adoptó al instante.',
            name: 'Carlos Méndez',
            role: 'Gerente General',
            stars: 5,
        },
        {
            emoji: '🍣',
            restaurant: 'Sushi House',
            quote: 'El sistema de mesas nos permite tener visual de todo el salón en tiempo real. Los reportes son oro puro para tomar decisiones de negocio.',
            name: 'María Silva',
            role: 'Propietaria',
            stars: 5,
        },
        {
            emoji: '🥩',
            restaurant: 'Parrilla Don Julio',
            quote: 'La facturación automática nos ahorra horas cada semana. Antes cerrábamos caja a las 2am, ahora en 10 minutos. Simplemente funciona.',
            name: 'Roberto Pérez',
            role: 'Administrador',
            stars: 5,
        },
    ];

    trackByIdx(i: number): number { return i; }
}
