import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ContratoService } from '../../services/contrato.service';
import { SecureStorageService } from '../services/secure-storage.service';

/**
 * Bloquea el acceso al panel hasta que el admin-local acepte el contrato.
 * Solo aplica a `rol = admin-local`. Otros roles pasan directo. La página
 * `/contrato` está exenta para evitar redirect loop.
 */
export const contratoGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const svc = inject(ContratoService);
  const storage = inject(SecureStorageService);

  // Exento: la propia página /contrato.
  if (state.url.startsWith('/contrato')) return true;

  const user = storage.getJson<any>('user');
  const rol = String(user?.rol || '').toLowerCase();
  // Solo admin-local debe firmar contrato. Admin, marketing, etc. pasan.
  if (rol !== 'admin-local') return true;

  return svc.miEstado().pipe(
    map((estado) => {
      if (estado.aceptado) return true;
      router.navigate(['/contrato']);
      return false;
    }),
    catchError(() => {
      // Si el back falla, no bloqueamos (mejor que dejar al admin afuera).
      return of(true);
    }),
  );
};
