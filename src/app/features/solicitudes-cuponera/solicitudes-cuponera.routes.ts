import { Routes } from '@angular/router';

export const SOLICITUDES_CUPONERA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/listado/listado-solicitudes').then(
        (m) => m.ListadoSolicitudes,
      ),
  },
];
