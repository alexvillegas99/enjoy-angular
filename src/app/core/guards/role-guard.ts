import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth';
import { PermissionsService } from '../services/permissions.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const permService = inject(PermissionsService);
  const router = inject(Router);

  const user = auth.user;

  if (!user) {
    router.navigate(['/auth']);
    return false;
  }

  // Nuevo: verificación por permisos
  const requiredPerms = route.data?.['permissions'] as string[];
  if (requiredPerms?.length) {
    if (permService.hasAnyPermission(requiredPerms)) {
      return true;
    }
    // Redirección inteligente
    if (user.rol === 'admin-local') {
      router.navigate(['/dashboard-local']);
    } else {
      router.navigate(['/dashboard']);
    }
    return false;
  }

  // Legacy: verificación por roles string
  const allowedRoles = route.data?.['roles'] as string[];

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (allowedRoles.includes(user.rol)) {
    return true;
  }

  if (user.rol === 'admin-local') {
    router.navigate(['/dashboard-local']);
  } else {
    router.navigate(['/dashboard']);
  }

  return false;
};
