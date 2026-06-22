import { Routes } from '@angular/router';

export const PROMOCIONES_FLASH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/listado/listado-flash').then((m) => m.ListadoFlash),
  },
  {
    path: 'nueva',
    loadComponent: () =>
      import('./pages/form/form-flash').then((m) => m.FormFlash),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/form/form-flash').then((m) => m.FormFlash),
  },
];
