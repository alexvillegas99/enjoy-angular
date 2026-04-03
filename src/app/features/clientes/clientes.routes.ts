import { Routes } from '@angular/router';
import { Clientes } from './clientes';

export const clientesRoutes: Routes = [
  {
    path: '',
    component: Clientes,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/listado-clientes/listado-clientes').then(
            (m) => m.ListadoClientes,
          ),
        data: {
          titulo: 'Clientes',
          subtitulo: 'Gestión de clientes',
        },
      },
      {
        path: 'nuevo',
        loadComponent: () =>
          import('./pages/editar-cliente/editar-cliente').then(
            (m) => m.EditarCliente,
          ),
        data: {
          titulo: 'Nuevo cliente',
        },
      },
      {
        path: ':id/editar',
        loadComponent: () =>
          import('./pages/editar-cliente/editar-cliente').then(
            (m) => m.EditarCliente,
          ),
        data: {
          titulo: 'Editar cliente',
        },
      },
    ],
  },
];
