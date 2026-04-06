import { Routes } from '@angular/router';

export const pagosRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/configuracion-pagos/configuracion-pagos').then(
        (m) => m.ConfiguracionPagos,
      ),
    data: { titulo: 'Configuración de Pagos' },
  },
];
