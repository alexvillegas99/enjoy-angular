export interface SidebarItem {
  label: string;
  route: string;
  icon: string; // 👈 CORRECTO
}

export const SIDEBAR_MENU_ADMIN: SidebarItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'layout-dashboard' },
  { label: 'Cupones', route: '/cupones', icon: 'ticket' },
  { label: 'Crear cupón', route: '/cupones/nuevo', icon: 'circle-plus' },
  { label: 'Categorías', route: '/catalogos', icon: 'tags' },
  { label: 'Reportes', route: '/reportes', icon: 'chart-column' },
  { label: 'Usuarios', route: '/usuarios', icon: 'users' },
  { label: 'Clientes', route: '/clientes', icon: 'user' },
  { label: 'Establecimientos', route: '/establecimientos', icon: 'store' },
];
export const SIDEBAR_MENU_ADMIN_LOCAL: SidebarItem[] = [
  {
    label: 'Dashboard Local',
    route: '/dashboard-local',
    icon: 'layout-dashboard',
  },
  {
    label: 'Usuarios Local',
    route: '/dashboard-local/usuarios',
    icon: 'users',
  },
  {
    label: 'Perfil Local',
    route: '/dashboard-local/perfil',
    icon: 'user',
  }
];

export const SIDEBAR_MENU_ADMIN_MOBILE: SidebarItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'layout-dashboard' },
  { label: 'Cupones', route: '/cupones', icon: 'ticket' },
  { label: 'Usuarios', route: '/usuarios', icon: 'users' },
  { label: 'Locales', route: '/establecimientos', icon: 'store' },
];
export const SIDEBAR_MENU_ADMIN_LOCAL_MOBILE: SidebarItem[] = [
  {
    label: 'Dashboard',
    route: '/dashboard-local',
    icon: 'layout-dashboard',
  },
  {
    label: 'Usuarios',
    route: '/dashboard-local/usuarios',
    icon: 'users',
  },
   {
    label: 'Perfil',
    route: '/dashboard-local/perfil',
    icon: 'user',
  }
];
