import { Component, EventEmitter, HostListener, Output } from '@angular/core';

@Component({
    selector: 'app-landing-navbar',
    templateUrl: './landing-navbar.component.html',
    styleUrls: ['./landing-navbar.component.css']
})
export class LandingNavbarComponent {

    @Output() navigate = new EventEmitter<string>();

    scrolled = false;
    menuOpen = false;

    navLinks = [
        { label: 'Características', target: 'caracteristicas' },
        { label: 'Cómo funciona', target: 'como-funciona' },
        { label: 'Precios', target: 'precios' },
        { label: 'Testimonios', target: 'testimonios' },
    ];

    @HostListener('window:scroll')
    onScroll(): void {
        this.scrolled = window.scrollY > 40;
    }

    goTo(target: string): void {
        this.menuOpen = false;
        this.navigate.emit(target);
    }

    toggleMenu(): void {
        this.menuOpen = !this.menuOpen;
    }
}
