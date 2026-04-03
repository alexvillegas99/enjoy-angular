import { Routes } from '@angular/router';
import { Catalogos } from './catalogos/catalogos';

export const catalogosRoutes: Routes = [
  {
    path: '',
    component: Catalogos,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/inicio-catalogos/inicio-catalogos').then(
            (m) => m.InicioCatalogos,
          ),
        data: {
          titulo: 'Catálogos',
          subtitulo: 'Configuraciones dinámicas',
        },
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./pages/categorias/listado-categorias/listado-categorias').then(
            (m) => m.ListadoCategorias,
          ),
        data: {
          titulo: 'Categorías',
          crear: '/catalogos/categorias/nuevo',
        },
      },

      {
        path: 'versiones-cuponera',
        loadComponent: () =>
          import('./pages/versiones-cuponera/versiones-cuponera').then(
            (m) => m.VersionesCuponera,
          ),
        data: {
          titulo: 'Versiones',
          crear: '/catalogos/ciudades/nuevo',
        },
      },
      {
        path: 'ciudades',
        loadComponent: () =>
          import('./pages/ciudades/listado-ciudades/listado-ciudades').then(
            (m) => m.ListadoCiudades,
          ),
        data: {
          titulo: 'Ciudades',
          crear: '/catalogos/ciudades/nuevo',
        },
      },
    ],
  },
];
