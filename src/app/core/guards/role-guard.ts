import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.user;

  if (!user) {
    router.navigate(['/auth']);
    return false;
  }

  const allowedRoles = route.data?.['roles'] as string[];

  if (!allowedRoles || allowedRoles.length === 0) {
    return true; // si no define roles, permite
  }

  if (allowedRoles.includes(user.rol)) {
    return true;
  }

  // 🔥 Redirección inteligente según rol
  if (user.rol === 'admin-local') {
    router.navigate(['/dashboard-local']);
  } else {
    router.navigate(['/dashboard']);
  }

  return false;
};
