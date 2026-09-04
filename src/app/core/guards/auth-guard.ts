import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  console.log('--- AuthGuard Check ---');
  console.log('Token présent :', !!token);

  // 1. المستخدم غير مسجل الدخول
  if (!token) {
    console.warn('Accès refusé : Aucun token trouvé.');
    router.navigate(['/login']);
    return false;
  }

  // 2. الحصول على الدور المطلوب للصفحة
  const allowedRoles = route.data['roles'] as string[] | undefined;

  // إذا لم تحدد الصفحة أدواراً، السماح للمستخدم
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  // 3. الحصول على دور المستخدم
  const userRole = authService.getUserRole();

  console.log('Role utilisateur :', userRole);
  console.log('Roles autorisés :', allowedRoles);

  // 4. التحقق من الدور
  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  // 5. الدور غير مسموح
  console.warn('Accès refusé : rôle non autorisé.');

  // نرجعه إلى patients أو login حسب اختيارنا
  router.navigate(['/patients']);

  return false;
};