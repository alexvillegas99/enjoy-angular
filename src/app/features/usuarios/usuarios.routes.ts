import { Routes } from '@angular/router';
import { Usuarios } from './usuarios/usuarios';

export const usuariosRoutes: Routes = [
  {
    path: '',
    component: Usuarios,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/listado-usuarios/listado-usuarios').then(
            (m) => m.ListadoUsuarios,
          ),
        data: {
          titulo: 'Usuarios',
          subtitulo: 'Gestión de usuarios',
        },
      },

      // CREAR
      {
        path: 'nuevo',
        loadComponent: () =>
          import('./pages/editar-usuario/editar-usuario').then(
            (m) => m.EditarUsuario,
          ),
        data: {
          titulo: 'Crear usuario',
        },
      },

      // EDITAR
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/editar-usuario/editar-usuario').then(
            (m) => m.EditarUsuario,
          ),
        data: {
          titulo: 'Editar usuario',
        },
      },
    ],
  },
];
