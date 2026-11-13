import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';

export const SOLICITUDES_CUPONERA_ROUTES: Routes = [
  {
    path: 'por-atender',
    canActivate: [roleGuard],
    data: { permissions: ['solicitudes.aprobar'], roles: ['admin'] },
    loadComponent: () =>
      import('./pages/por-atender/cobros-por-atender').then((m) => m.CobrosPorAtender),
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/listado/listado-solicitudes').then(
        (m) => m.ListadoSolicitudes,
      ),
  },
];
