import { Routes } from '@angular/router';
import { Reportes } from './reportes/reportes';

export const reportesRoutes: Routes = [
  {
    path: '',
    component: Reportes,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/inicio-reportes/inicio-reportes/inicio-reportes').then(
            (m) => m.InicioReportes,
          ),
        data: {
          titulo: 'Reportes',
          subtitulo: 'Indicadores y métricas',
        },
      },
    ],
  },
];
