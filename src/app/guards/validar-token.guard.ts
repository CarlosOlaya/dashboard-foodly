import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { of, take, tap } from 'rxjs';


export const validarTokenGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // No token — go straight to login without an HTTP call
  if (!authService.token) {
    router.navigate(['/auth']);
    return of(false);
  }

  return authService.validarToken().pipe(
    take(1),
    tap(autenticado => {
      if (!autenticado) router.navigate(['/auth']);
    })
  );
};