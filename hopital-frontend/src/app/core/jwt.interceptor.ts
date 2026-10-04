import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  // Ne pas ajouter l'en-tête sur la requête de login
  if (token && !req.url.includes('/login/')) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Token ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};