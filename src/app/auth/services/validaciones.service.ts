import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ValidacionesService {
    emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

    campoValido(form: any, campo: string): boolean {
        return form.controls[campo]?.invalid && form.controls[campo]?.touched;
    }
}
