import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-landing-footer',
    templateUrl: './landing-footer.component.html',
    styleUrls: ['./landing-footer.component.css']
})
export class LandingFooterComponent {
    @Output() navigate = new EventEmitter<string>();
    currentYear = new Date().getFullYear();

    footerLinks = {
        producto: [
            { label: 'Características', target: 'caracteristicas' },
            { label: 'Precios', target: 'precios' },
            { label: 'Testimonios', target: 'testimonios' },
        ],
        empresa: [
            { label: 'Sobre nosotros', target: '' },
            { label: 'Blog', target: '' },
            { label: 'Contacto', target: '' },
        ],
        legal: [
            { label: 'Términos y condiciones', target: '' },
            { label: 'Política de privacidad', target: '' },
        ]
    };

    goTo(target: string): void {
        if (target) this.navigate.emit(target);
    }
}
