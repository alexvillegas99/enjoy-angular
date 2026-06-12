import { Routes } from '@angular/router';

export const EMPRESAS_SOLICITUDES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/listado/listado-empresas-solicitudes').then(
        (m) => m.ListadoEmpresasSolicitudes,
      ),
  },
];
