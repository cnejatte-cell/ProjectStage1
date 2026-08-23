import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken() || localStorage.getItem('token');

  console.log('--- AuthGuard Check ---');
  console.log('Token présent :', !!token);

  if (token) {
    return true;
  }

  console.warn('Accès refusé : Aucun token trouvé. Redirection vers /login');
  router.navigate(['/login']);
  return false;
};