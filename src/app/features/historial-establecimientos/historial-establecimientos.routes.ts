import { Routes } from '@angular/router';

export const HISTORIAL_ESTABLECIMIENTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/listado/listado-historial').then(
        (m) => m.ListadoHistorial,
      ),
  },
];
