import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a number as Colombian currency: $1.234.567
 *
 * Usage:   {{ 15000 | moneda }}           → $15.000
 *          {{ 1500000 | moneda:'short' }} → $1.5M
 */
@Pipe({ name: 'moneda' })
export class MonedaPipe implements PipeTransform {

    transform(value: number | string | null | undefined, mode: 'full' | 'short' = 'full'): string {
        const num = Number(value) || 0;

        if (mode === 'short') {
            if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
            if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
            return `$${num.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
        }

        return '$' + num.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
}
