import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

export const adminGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAdmin) {
        return true;
    }

    router.navigate(['/home/mesas']);
    return false;
};
