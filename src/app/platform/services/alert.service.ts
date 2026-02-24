import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

/**
 * Centralised SweetAlert2 wrapper.
 * 
 * Encapsulates all common modal patterns used across the app so that
 * individual components don't need to import or configure Swal directly.
 */
@Injectable({ providedIn: 'root' })
export class AlertService {

    /* ── Toast (auto-close) ─────────────────────────────── */

    /** Green toast — operation succeeded */
    success(text: string, timer = 1500): void {
        Swal.fire({
            icon: 'success',
            text,
            timer,
            showConfirmButton: false,
            timerProgressBar: true,
        });
    }

    /** Red toast — something failed */
    error(text: string, timer = 1500): void {
        Swal.fire({
            icon: 'error',
            text,
            timer,
            showConfirmButton: false,
            timerProgressBar: true,
        });
    }

    /** Blue info toast */
    info(text: string, timer?: number): void {
        Swal.fire({
            icon: 'info',
            text,
            ...(timer ? { timer, showConfirmButton: false, timerProgressBar: true } : {}),
        });
    }

    /** Orange warning toast */
    warning(text: string, timer?: number): void {
        Swal.fire({
            icon: 'warning',
            text,
            ...(timer ? { timer, showConfirmButton: false, timerProgressBar: true } : {}),
        });
    }

    /* ── Confirmación ───────────────────────────────────── */

    /**
     * Shows a confirm dialog and returns `true` if confirmed.
     * 
     * ```ts
     * if (await this.alert.confirm('¿Eliminar?')) { ... }
     * ```
     */
    async confirm(
        text: string,
        confirmText = 'Sí, confirmar',
        cancelText = 'Cancelar',
    ): Promise<boolean> {
        const result = await Swal.fire({
            text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
        });
        return !!result.isConfirmed;
    }

    /* ── API Response handler ───────────────────────────── */

    /**
     * Shows success/error toast based on an `{ ok, mensaje }` API response.
     * Returns `true` when `resp.ok` is truthy.
     */
    handleResponse(resp: { ok: boolean; mensaje: string }, timer = 1500): boolean {
        if (resp.ok) {
            this.success(resp.mensaje, timer);
        } else {
            this.error(resp.mensaje, timer);
        }
        return resp.ok;
    }

    /* ── Raw Swal passthrough ───────────────────────────── */

    /**
     * For advanced dialogs (custom HTML, inputs, preConfirm, etc.)
     * that don't fit a standard pattern. Delegates directly to Swal.fire.
     */
    fire(options: SweetAlertOptions): Promise<SweetAlertResult> {
        return Swal.fire(options);
    }

    /** Expose Swal.showValidationMessage for preConfirm callbacks */
    showValidationMessage(msg: string): void {
        Swal.showValidationMessage(msg);
    }

    /** Close the current Swal modal programmatically */
    close(): void {
        Swal.close();
    }
}
