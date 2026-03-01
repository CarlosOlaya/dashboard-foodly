import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.css']
})
export class LandingComponent implements AfterViewInit, OnDestroy {

    private observer!: IntersectionObserver;
    private isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) platformId: Object) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngAfterViewInit(): void {
        if (!this.isBrowser) return;

        // Scroll-reveal animation using IntersectionObserver
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    this.observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.reveal').forEach(el => this.observer.observe(el));
    }

    ngOnDestroy(): void {
        if (this.observer) this.observer.disconnect();
    }

    scrollTo(sectionId: string): void {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
}
