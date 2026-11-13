export interface SidebarItem {
  label: string;
  /** Ruta — opcional para grupos (los grupos solo tienen children). */
  route?: string;
  icon: string;
  permission?: string;
  /** Si true, se muestra también en el bottom-nav móvil. */
  mobile?: boolean;
  /**
   * Si true, este item solo se marca activo cuando la URL es EXACTAMENTE
   * `route` (no en sub-rutas). Útil cuando otro item del menú está bajo
   * la misma ruta padre.
   */
  exact?: boolean;
  /** Si presente, este item es un GRUPO colapsable y `route` se ignora. */
  children?: SidebarItem[];
}

/**
 * Menú completo con todos los items y sus permisos requeridos.
 * Estructura jerárquica: grupos (con `children`) e items planos.
 * Un grupo se muestra si tiene al menos un hijo visible por permisos.
 */
export const SIDEBAR_MENU_FULL: SidebarItem[] = [
  // ── Inicio (planos) ──
  { label: 'Dashboard', route: '/dashboard', icon: 'layout-dashboard', permission: 'dashboard.ver', mobile: true },

  // ── Mi local (admin-local) ──
  {
    label: 'Mi local',
    icon: 'store',
    children: [
      { label: 'Dashboard', route: '/dashboard-local', icon: 'layout-dashboard', exact: true, permission: 'dashboard-local.ver', mobile: true },
      { label: 'Usuarios', route: '/dashboard-local/usuarios', icon: 'users', permission: 'usuarios-local.ver', mobile: true },
      { label: 'Perfil', route: '/dashboard-local/perfil', icon: 'user', permission: 'perfil-local.ver', mobile: true },
      { label: 'Promos Flash', route: '/promociones-flash', icon: 'zap', permission: 'promociones-flash.gestionar', mobile: true },
    ],
  },

  // ── Catálogo ──
  {
    label: 'Catálogo',
    icon: 'ticket',
    children: [
      { label: 'Cupones', route: '/cupones', icon: 'ticket', exact: true, permission: 'cupones.ver', mobile: true },
      { label: 'Crear cupón', route: '/cupones/nuevo', icon: 'circle-plus', permission: 'cupones.crear' },
      { label: 'Categorías', route: '/catalogos', icon: 'tags', permission: 'categorias.ver' },
    ],
  },

  // ── Establecimientos ──
  {
    label: 'Establecimientos',
    icon: 'building-2',
    children: [
      { label: 'Establecimientos', route: '/establecimientos', icon: 'store', permission: 'establecimientos.ver', mobile: true },
      { label: 'Solicitudes empresas', route: '/empresas-solicitudes', icon: 'building-2', permission: 'solicitudes.ver' },
      { label: 'Historial cambios', route: '/historial-establecimientos', icon: 'history', permission: 'dashboard.ver' },
    ],
  },

  // ── Personas ──
  {
    label: 'Personas',
    icon: 'users',
    children: [
      { label: 'Clientes', route: '/clientes', icon: 'user', permission: 'clientes.ver' },
      { label: 'Promotores', route: '/promotores', icon: 'user-check', permission: 'promotores.ver' },
    ],
  },

  // ── Ventas ──
  {
    label: 'Ventas',
    icon: 'credit-card',
    children: [
      { label: 'Solicitudes cuponera', route: '/solicitudes-cuponera', icon: 'landmark', permission: 'solicitudes.ver' },
      { label: 'Pagos', route: '/pagos', icon: 'credit-card', permission: 'pagos.configurar' },
    ],
  },

  // ── Comunicación ──
  {
    label: 'Comunicación',
    icon: 'megaphone',
    children: [
      { label: 'Notificaciones', route: '/notificaciones', icon: 'bell', permission: 'notificaciones.ver' },
    ],
  },

  // ── Análisis ──
  { label: 'Reportes', route: '/reportes', icon: 'chart-column', permission: 'reportes.ver' },

  // ── Sistema ──
  {
    label: 'Sistema',
    icon: 'settings',
    children: [
      { label: 'Usuarios', route: '/usuarios', icon: 'users', permission: 'usuarios.ver', mobile: true },
      { label: 'Roles', route: '/roles', icon: 'shield', permission: 'roles.ver' },
      { label: 'Configuración', route: '/configuracion', icon: 'settings', permission: 'configuracion.ver' },
    ],
  },

  // ── Soporte SIEMPRE al final (planos, dos entradas por permisos distintos) ──
  { label: 'Soporte', route: '/chat', icon: 'headphones', permission: 'chat.ver', mobile: true },
  { label: 'Soporte', route: '/chat', icon: 'headphones', permission: 'perfil-local.ver', mobile: true },
];

// ── Legacy: menús hardcodeados (fallback para usuarios sin permisos cargados) ──

export const SIDEBAR_MENU_ADMIN: SidebarItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'layout-dashboard' },
  { label: 'Cupones', route: '/cupones', icon: 'ticket', exact: true },
  { label: 'Crear cupón', route: '/cupones/nuevo', icon: 'circle-plus' },
  { label: 'Categorías', route: '/catalogos', icon: 'tags' },
  { label: 'Reportes', route: '/reportes', icon: 'chart-column' },
  { label: 'Usuarios', route: '/usuarios', icon: 'users' },
  { label: 'Clientes', route: '/clientes', icon: 'user' },
  { label: 'Establecimientos', route: '/establecimientos', icon: 'store' },
  { label: 'Configuración', route: '/configuracion', icon: 'settings' },
  { label: 'Solicitudes Cuponera', route: '/solicitudes-cuponera', icon: 'landmark' },
  { label: 'Solicitudes Empresas', route: '/empresas-solicitudes', icon: 'building-2' },
  { label: 'Pagos', route: '/pagos', icon: 'credit-card' },
  { label: 'Roles', route: '/roles', icon: 'shield' },
];

export const SIDEBAR_MENU_ADMIN_LOCAL: SidebarItem[] = [
  { label: 'Dashboard Local', route: '/dashboard-local', icon: 'layout-dashboard', exact: true },
  { label: 'Usuarios Local', route: '/dashboard-local/usuarios', icon: 'users' },
  { label: 'Perfil Local', route: '/dashboard-local/perfil', icon: 'user' },
  { label: 'Promos Flash', route: '/promociones-flash', icon: 'zap' },
  { label: 'Soporte', route: '/chat', icon: 'headphones' },
];

export const SIDEBAR_MENU_ADMIN_MOBILE: SidebarItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'layout-dashboard' },
  { label: 'Cupones', route: '/cupones', icon: 'ticket', exact: true },
  { label: 'Usuarios', route: '/usuarios', icon: 'users' },
  { label: 'Locales', route: '/establecimientos', icon: 'store' },
];

export const SIDEBAR_MENU_ADMIN_LOCAL_MOBILE: SidebarItem[] = [
  { label: 'Dashboard', route: '/dashboard-local', icon: 'layout-dashboard', exact: true },
  { label: 'Usuarios', route: '/dashboard-local/usuarios', icon: 'users' },
  { label: 'Perfil', route: '/dashboard-local/perfil', icon: 'user' },
];
