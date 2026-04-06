import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';

export const adminLocalRoutes: Routes = [

  {
    path: '',
    canActivate: [roleGuard],
    data: { permissions: ['dashboard-local.ver'], roles: ['admin-local'] },
    loadComponent: () =>
      import('./pages/dashboard-local/dashboard-local')
        .then(m => m.DashboardLocal),
  },

  {
    path: 'usuarios',
    canActivate: [roleGuard],
    data: { permissions: ['usuarios-local.ver'], roles: ['admin-local'] },
    loadComponent: () =>
      import('./pages/usuarios-local/usuarios-local')
        .then(m => m.UsuariosLocal),
  },
  {
    path: 'perfil',
    canActivate: [roleGuard],
    data: { permissions: ['perfil-local.ver'], roles: ['admin-local'] },
    loadComponent: () =>
      import('./pages/perfil-local/perfil-local')
        .then(m => m.PerfilLocal),
  },
];
