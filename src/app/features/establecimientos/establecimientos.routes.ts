import { Routes } from '@angular/router';

export const ESTABLECIMIENTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/listado/listado-establecimientos')
        .then(m => m.ListadoEstablecimientos),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/crear-editar/crear-editar-establecimiento')
        .then(m => m.CrearEditarEstablecimiento),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/crear-editar/crear-editar-establecimiento')
        .then(m => m.CrearEditarEstablecimiento),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/detalle/detalle-establecimiento')
        .then(m => m.DetalleEstablecimiento),
  },
];
