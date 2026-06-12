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
        data: { titulo: 'Reportes', subtitulo: 'Indicadores y métricas' },
      },
      {
        path: 'canjes',
        loadComponent: () =>
          import('./pages/canjes/canjes-reporte').then((m) => m.CanjesReporte),
        data: { titulo: 'Canjes & Ingresos' },
      },
      {
        path: 'locales',
        loadComponent: () =>
          import('./pages/locales/locales-reporte').then(
            (m) => m.LocalesReporte,
          ),
        data: { titulo: 'Locales & Vendedores' },
      },
      {
        path: 'creador/:id',
        loadComponent: () =>
          import('./pages/creador-detalle/creador-detalle').then(
            (m) => m.CreadorDetalle,
          ),
        data: { titulo: 'Detalle de creador' },
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./pages/clientes/clientes-reporte').then(
            (m) => m.ClientesReporte,
          ),
        data: { titulo: 'Clientes & Retención' },
      },
      {
        path: 'flash',
        loadComponent: () =>
          import('./pages/flash/flash-reporte').then((m) => m.FlashReporte),
        data: { titulo: 'Flash & Solicitudes' },
      },
    ],
  },
];
