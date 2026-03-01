import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { LandingComponent } from './landing.component';
import { LandingNavbarComponent } from './components/landing-navbar/landing-navbar.component';
import { LandingHeroComponent } from './components/landing-hero/landing-hero.component';
import { LandingFeaturesComponent } from './components/landing-features/landing-features.component';
import { LandingHowItWorksComponent } from './components/landing-how-it-works/landing-how-it-works.component';
import { LandingPricingComponent } from './components/landing-pricing/landing-pricing.component';
import { LandingTestimonialsComponent } from './components/landing-testimonials/landing-testimonials.component';
import { LandingFooterComponent } from './components/landing-footer/landing-footer.component';

const routes: Routes = [
    { path: '', component: LandingComponent }
];

@NgModule({
    declarations: [
        LandingComponent,
        LandingNavbarComponent,
        LandingHeroComponent,
        LandingFeaturesComponent,
        LandingHowItWorksComponent,
        LandingPricingComponent,
        LandingTestimonialsComponent,
        LandingFooterComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
    ]
})
export class LandingModule { }
