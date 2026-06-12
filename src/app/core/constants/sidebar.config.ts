export interface SidebarItem {
  label: string;
  route: string;
  icon: string;
  permission?: string;
  mobile?: boolean; // si true, se muestra también en bottom-nav
}

/** Menú completo con todos los items y sus permisos requeridos */
export const SIDEBAR_MENU_FULL: SidebarItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'layout-dashboard', permission: 'dashboard.ver', mobile: true },
  { label: 'Dashboard Local', route: '/dashboard-local', icon: 'layout-dashboard', permission: 'dashboard-local.ver', mobile: true },
  { label: 'Usuarios Local', route: '/dashboard-local/usuarios', icon: 'users', permission: 'usuarios-local.ver', mobile: true },
  { label: 'Perfil Local', route: '/dashboard-local/perfil', icon: 'user', permission: 'perfil-local.ver', mobile: true },
  { label: 'Cupones', route: '/cupones', icon: 'ticket', permission: 'cupones.ver', mobile: true },
  { label: 'Crear cupón', route: '/cupones/nuevo', icon: 'circle-plus', permission: 'cupones.crear' },
  { label: 'Categorías', route: '/catalogos', icon: 'tags', permission: 'categorias.ver' },
  { label: 'Reportes', route: '/reportes', icon: 'chart-column', permission: 'reportes.ver' },
  { label: 'Notificaciones', route: '/notificaciones', icon: 'bell', permission: 'notificaciones.ver' },
  { label: 'Usuarios', route: '/usuarios', icon: 'users', permission: 'usuarios.ver', mobile: true },
  { label: 'Clientes', route: '/clientes', icon: 'user', permission: 'clientes.ver' },
  { label: 'Establecimientos', route: '/establecimientos', icon: 'store', permission: 'establecimientos.ver', mobile: true },
  { label: 'Configuración', route: '/configuracion', icon: 'settings', permission: 'configuracion.ver' },
  { label: 'Solicitudes Cuponera', route: '/solicitudes-cuponera', icon: 'landmark', permission: 'solicitudes.ver' },
  { label: 'Solicitudes Empresas', route: '/empresas-solicitudes', icon: 'building-2', permission: 'solicitudes.ver' },
  { label: 'Historial Cambios', route: '/historial-establecimientos', icon: 'history', permission: 'dashboard.ver' },
  { label: 'Pagos', route: '/pagos', icon: 'credit-card', permission: 'pagos.configurar' },
  { label: 'Roles', route: '/roles', icon: 'shield', permission: 'roles.ver' },
  // Soporte siempre AL FINAL
  { label: 'Soporte', route: '/chat', icon: 'headphones', permission: 'chat.ver', mobile: true },
  { label: 'Soporte', route: '/chat', icon: 'headphones', permission: 'perfil-local.ver', mobile: true },
];

// ── Legacy: menús hardcodeados (fallback para usuarios sin permisos cargados) ──

export const SIDEBAR_MENU_ADMIN: SidebarItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'layout-dashboard' },
  { label: 'Cupones', route: '/cupones', icon: 'ticket' },
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
  { label: 'Dashboard Local', route: '/dashboard-local', icon: 'layout-dashboard' },
  { label: 'Usuarios Local', route: '/dashboard-local/usuarios', icon: 'users' },
  { label: 'Perfil Local', route: '/dashboard-local/perfil', icon: 'user' },
  { label: 'Soporte', route: '/chat', icon: 'headphones' },
];

export const SIDEBAR_MENU_ADMIN_MOBILE: SidebarItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'layout-dashboard' },
  { label: 'Cupones', route: '/cupones', icon: 'ticket' },
  { label: 'Usuarios', route: '/usuarios', icon: 'users' },
  { label: 'Locales', route: '/establecimientos', icon: 'store' },
];

export const SIDEBAR_MENU_ADMIN_LOCAL_MOBILE: SidebarItem[] = [
  { label: 'Dashboard', route: '/dashboard-local', icon: 'layout-dashboard' },
  { label: 'Usuarios', route: '/dashboard-local/usuarios', icon: 'users' },
  { label: 'Perfil', route: '/dashboard-local/perfil', icon: 'user' },
];
