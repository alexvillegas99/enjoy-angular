import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.token;
  console.log('AuthGuard: token encontrado', !!token);
  console.log(token)
  // 1️⃣ No hay token
  if (!token) {
    router.navigate(['/auth/login']);
    return false;
  }

  // 2️⃣ Intentar refresh para validar sesión real
  return auth.refreshToken().pipe(
    map(() => true),
    catchError(() => {
      auth.logout();
      router.navigate(['/auth/login']);
      return of(false);
    }),
  );
};
