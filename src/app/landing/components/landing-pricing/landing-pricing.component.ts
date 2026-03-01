import { Component } from '@angular/core';
import { Plan } from '../../../shared/interfaces/plan.interface';
import { PLANES } from '../../../shared/data/planes.data';

@Component({
    selector: 'app-landing-pricing',
    templateUrl: './landing-pricing.component.html',
    styleUrls: ['./landing-pricing.component.css']
})
export class LandingPricingComponent {

    /** Same data as OnboardComponent — single source of truth */
    planes: Plan[] = PLANES;
}
