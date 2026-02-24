import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'imagen' })
export class ImagenPipe implements PipeTransform {

  transform(input: any): string {
    // Plato
    if (input?.imagen_url) {
      return input.imagen_url;
    }
    // Mesa
    if ('numero' in input) {
      return 'assets/mesa.png';
    }
    // Default avatar
    return 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
  }
}
