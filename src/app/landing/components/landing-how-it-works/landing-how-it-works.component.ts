import { Component } from '@angular/core';

@Component({
    selector: 'app-landing-how-it-works',
    templateUrl: './landing-how-it-works.component.html',
    styleUrls: ['./landing-how-it-works.component.css']
})
export class LandingHowItWorksComponent {
    steps = [
        { num: '01', icon: 'person_add', title: 'Regístrate', desc: 'Crea tu cuenta gratis en menos de 2 minutos. Sin tarjeta de crédito requerida.' },
        { num: '02', icon: 'restaurant_menu', title: 'Configura tu menú', desc: 'Agrega tus platos, categorías y precios. Importa tu carta completa fácilmente.' },
        { num: '03', icon: 'rocket_launch', title: '¡Listo para operar!', desc: 'Empieza a tomar comandas, facturar y controlar tu restaurante desde cualquier dispositivo.' },
    ];
}
