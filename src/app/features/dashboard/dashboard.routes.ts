import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: Home,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home/home').then(
            (m) => m.Home,
          ),
        data: {
          titulo: 'Dashboard',
          subtitulo: 'Resumen general',
        },
      },
    ],
  },
];
