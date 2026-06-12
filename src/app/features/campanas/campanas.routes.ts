import { Routes } from '@angular/router';

export const campanasRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/listado/listado-campanas').then(
        (m) => m.ListadoCampanas,
      ),
    data: { titulo: 'Notificaciones' },
  },
  {
    path: 'nueva',
    loadComponent: () =>
      import('./pages/form/form-campana').then((m) => m.FormCampana),
    data: { titulo: 'Nueva campaña' },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/form/form-campana').then((m) => m.FormCampana),
    data: { titulo: 'Editar campaña' },
  },
];
