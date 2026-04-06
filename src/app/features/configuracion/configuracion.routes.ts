import { Routes } from '@angular/router';

export const CONFIGURACION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/ajustes/ajustes').then((m) => m.Ajustes),
  },
];
