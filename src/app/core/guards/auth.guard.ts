import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth';
import { PermissionsService } from '../services/permissions.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const permService = inject(PermissionsService);
  const router = inject(Router);

  const token = auth.token;

  if (!token) {
    router.navigate(['/auth/login']);
    return false;
  }

  return auth.refreshToken().pipe(
    map(() => {
      // Validar permiso de acceso web
      if (!permService.hasPermission('web.acceso')) {
        auth.logout();
        router.navigate(['/auth/login']);
        return false;
      }
      return true;
    }),
    catchError(() => {
      auth.logout();
      router.navigate(['/auth/login']);
      return of(false);
    }),
  );
};
