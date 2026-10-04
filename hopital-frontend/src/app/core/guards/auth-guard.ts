import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  console.log('--- AuthGuard Check ---');
  console.log('Token présent :', !!token);

  // 1. Si aucun token n'est présent -> Direction Login
  if (!token) {
    console.warn('Accès refusé : Aucun token trouvé.');
    router.navigate(['/login']);
    return false;
  }

  // 2. Récupération des rôles autorisés pour la route
  const rawAllowedRoles = route.data['roles'] as string[] | undefined;

  // Si aucun rôle n'est spécifié sur la route -> Accès autorisé
  if (!rawAllowedRoles || rawAllowedRoles.length === 0) {
    return true;
  }

  // Normalisation des rôles de la route en majuscules
  const allowedRoles = rawAllowedRoles.map(role => role.toUpperCase());

  // 3. Récupération et normalisation du rôle utilisateur
  const rawUserRole = authService.getUserRole();
  const userRole = rawUserRole ? rawUserRole.toUpperCase().trim() : null;

  console.log('Rôle utilisateur (normalisé) :', userRole);
  console.log('Rôles autorisés (normalisés) :', allowedRoles);

  // 4. Vérification de l'autorisation
  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  // 5. Redirection en cas de rôle non autorisé
  console.warn('Accès refusé : rôle non autorisé pour cette page.');

  if (userRole === 'ADMIN') {
    router.navigate(['/admin/patients']); // 👈 FIX : Chemin exact de la route Admin
  } else if (userRole === 'NURSE' || userRole === 'INFIRMIER' || userRole === 'INFIRMIERE') {
    router.navigate(['/infirmiere']);
  } else if (userRole === 'DOCTOR' || userRole === 'MEDECIN') {
    router.navigate(['/medecin']);
  } else {
    router.navigate(['/login']);
  }

  return false;
};