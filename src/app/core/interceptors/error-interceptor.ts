import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AlertService } from '../services/alert.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const alert = inject(AlertService);

  return next(req).pipe(
    catchError((error) => {
      switch (error.status) {
        case 401:
          // Token inválido o expirado — limpiar sesión y redirigir
          localStorage.removeItem('accessToken');
          router.navigate(['/auth/login']);
          break;

        case 403:
          alert.error('Acceso denegado', 'No tienes permisos para esta acción.');
          break;

        case 0:
          alert.error('Sin conexión', 'No se pudo conectar con el servidor.');
          break;
      }

      return throwError(() => error);
    }),
  );
};
