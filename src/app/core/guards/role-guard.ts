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

  // Redirige a una ruta PERMITIDA según los permisos del usuario.
  // Nunca redirige a la ruta que se intentaba abrir (evita el bucle
  // de navegación / refresh-token infinito). Si no hay ninguna ruta
  // accesible, cierra sesión.
  const intentada = route.routeConfig?.path ? `/${route.routeConfig.path}` : '';
  const redirigirOSalir = () => {
    const destino = permService.getLandingRoute();
    if (destino && destino !== intentada) {
      router.navigate([destino]);
    } else {
      auth.logout();
      router.navigate(['/auth']);
    }
    return false;
  };

  // Nuevo: verificación por permisos
  const requiredPerms = route.data?.['permissions'] as string[];
  if (requiredPerms?.length) {
    if (permService.hasAnyPermission(requiredPerms)) {
      return true;
    }
    return redirigirOSalir();
  }

  // Legacy: verificación por roles string
  const allowedRoles = route.data?.['roles'] as string[];

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (allowedRoles.includes(user.rol)) {
    return true;
  }

  return redirigirOSalir();
};
