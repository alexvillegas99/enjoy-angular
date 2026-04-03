import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'privacy-policy',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./features/public/privacy-policy/privacy-policy').then(
        (m) => m.PrivacyPolicy,
      ),
  },
  // =====================
  // AUTH
  // =====================
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () =>
      import('./features/auth/pages/login/login.routes').then(
        (m) => m.loginRoutes,
      ),
  },
  {
    path: 'auth/recover-password',
    canActivate: [noAuthGuard],
    loadChildren: () =>
      import('./features/auth/pages/recover-password/recover-password.routes').then(
        (m) => m.recoverPasswordRoutes,
      ),
  },
  {
    path: 'auth/recover-user',
    canActivate: [noAuthGuard],
    loadChildren: () =>
      import('./features/auth/pages/recover-user/recover-user.routes').then(
        (m) => m.recoverUserRoutes,
      ),
  },
  {
    path: 'auth/unlock-user',
    canActivate: [noAuthGuard],
    loadChildren: () =>
      import('./features/auth/pages/unlock-user/unlock-user.routes').then(
        (m) => m.unlockUserRoutes,
      ),
  },

  // =====================
  // APP (LAYOUT PROTEGIDO)
  // =====================
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/dashboard-layout/dashboard-layout').then(
        (m) => m.DashboardLayout,
      ),
    children: [
      // 🔹 DASHBOARD admin
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.dashboardRoutes,
          ),
      },

      // 🔹 DASHBOARD admin LOCAL
      {
        path: 'dashboard-local',
        loadChildren: () =>
          import('./features/admin-local/admin-local.routes').then(
            (m) => m.adminLocalRoutes,
          ),
      },

      // 🔹 RUTAS SOLO admin
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadChildren: () =>
          import('./features/usuarios/usuarios.routes').then(
            (m) => m.usuariosRoutes,
          ),
      },
      {
        path: 'clientes',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadChildren: () =>
          import('./features/clientes/clientes.routes').then(
            (m) => m.clientesRoutes,
          ),
      },
      {
        path: 'reportes',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadChildren: () =>
          import('./features/reportes/reportes.routes').then(
            (m) => m.reportesRoutes,
          ),
      },

      // 🔹 RUTAS COMPARTIDAS
      {
        path: 'establecimientos',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'admin-local'] },
        loadChildren: () =>
          import('./features/establecimientos/establecimientos.routes').then(
            (m) => m.ESTABLECIMIENTOS_ROUTES,
          ),
      },
      {
        path: 'cupones',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'admin-local'] },
        loadComponent: () =>
          import('./features/cupones/cupones/cupones').then((m) => m.Cupones),
      },
      {
        path: 'cupones/nuevo',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'admin-local'] },
        loadComponent: () =>
          import('./features/cupones/pages/crear-cupon/crear-cupon').then(
            (m) => m.CrearCupon,
          ),
      },
      {
        path: 'catalogos',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'admin-local'] },
        loadChildren: () =>
          import('./features/catalogos/catalogos.routes').then(
            (m) => m.catalogosRoutes,
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
