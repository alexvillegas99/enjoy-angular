import { Routes } from '@angular/router';
import { Roles } from './roles/roles';

export const rolesRoutes: Routes = [
  {
    path: '',
    component: Roles,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/listado-roles/listado-roles').then(
            (m) => m.ListadoRoles,
          ),
        data: { titulo: 'Roles' },
      },
      {
        path: 'nuevo',
        loadComponent: () =>
          import('./pages/editar-rol/editar-rol').then(
            (m) => m.EditarRol,
          ),
        data: { titulo: 'Crear rol' },
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/editar-rol/editar-rol').then(
            (m) => m.EditarRol,
          ),
        data: { titulo: 'Editar rol' },
      },
    ],
  },
];
