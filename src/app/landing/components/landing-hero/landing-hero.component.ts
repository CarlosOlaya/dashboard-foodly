import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-landing-hero',
    templateUrl: './landing-hero.component.html',
    styleUrls: ['./landing-hero.component.css']
})
export class LandingHeroComponent {
    @Output() navigate = new EventEmitter<string>();
}
