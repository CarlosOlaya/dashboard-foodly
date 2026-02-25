import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-loading',
    template: `
    <div class="loading-state">
        <div class="loading-ring">
            <div></div><div></div><div></div><div></div>
        </div>
        <p class="loading-text" *ngIf="message">{{ message }}</p>
    </div>
    `,
    styles: [`
        .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 1rem;
            gap: 1rem;
        }

        .loading-text {
            color: var(--text-muted, #8b949e);
            font-size: 0.9rem;
            font-weight: 500;
            margin: 0;
        }

        /* Ring spinner */
        .loading-ring {
            display: inline-block;
            position: relative;
            width: 44px;
            height: 44px;
        }

        .loading-ring div {
            box-sizing: border-box;
            display: block;
            position: absolute;
            width: 36px;
            height: 36px;
            margin: 4px;
            border: 3px solid transparent;
            border-top-color: var(--brand-primary, #14b8a6);
            border-radius: 50%;
            animation: loading-ring-spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }

        .loading-ring div:nth-child(1) { animation-delay: -0.3s; }
        .loading-ring div:nth-child(2) { animation-delay: -0.2s; }
        .loading-ring div:nth-child(3) { animation-delay: -0.1s; }

        @keyframes loading-ring-spin {
            0%   { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `],
})
export class LoadingSpinnerComponent {
    @Input() message = 'Cargando...';
}
