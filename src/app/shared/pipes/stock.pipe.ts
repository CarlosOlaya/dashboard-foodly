import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a stock quantity based on its unit type.
 * - For 'unidad': no decimals (4.00 → 4)
 * - For weight/volume units (kg, gramo, litro, ml, libra): up to 2 decimals, trimming trailing zeros
 *
 * Usage:   {{ 4.0000 | stock:'unidad' }}  → 4
 *          {{ 1.5000 | stock:'kg' }}      → 1.5
 *          {{ 0.750  | stock:'litro' }}   → 0.75
 */
@Pipe({ name: 'stock' })
export class StockPipe implements PipeTransform {

    transform(value: number | string | null | undefined, tipoStock?: string): string {
        const num = Number(value);
        if (isNaN(num)) return '0';

        const tipo = (tipoStock || 'unidad').toLowerCase();

        if (tipo === 'unidad' || tipo === 'und') {
            return Math.round(num).toString();
        }

        // For kg, gramo, litro, ml, libra — show up to 2 decimals, removing trailing zeros
        const formatted = num.toFixed(2);
        // Remove trailing zeros: "1.50" → "1.5", "2.00" → "2"
        return parseFloat(formatted).toString();
    }
}
