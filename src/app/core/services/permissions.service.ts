import { Injectable } from '@angular/core';
import { SecureStorageService } from './secure-storage.service';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  constructor(private storage: SecureStorageService) {}

  /** Obtiene los permisos del usuario logueado */
  private getPermisos(): string[] {
    const user = this.storage.getJson<any>('user');
    return user?.permisos ?? [];
  }

  /** Verifica si el usuario tiene un permiso específico */
  hasPermission(permission: string): boolean {
    return this.getPermisos().includes(permission);
  }

  /** Verifica si el usuario tiene al menos uno de los permisos */
  hasAnyPermission(permissions: string[]): boolean {
    const userPermisos = this.getPermisos();
    return permissions.some((p) => userPermisos.includes(p));
  }

  /** Verifica si el usuario tiene todos los permisos */
  hasAllPermissions(permissions: string[]): boolean {
    const userPermisos = this.getPermisos();
    return permissions.every((p) => userPermisos.includes(p));
  }

  /**
   * Mapa ordenado permiso -> ruta. El primero que el usuario tenga
   * determina su pantalla de inicio. El orden define la prioridad.
   */
  private readonly routesByPermission: { permiso: string; ruta: string }[] = [
    { permiso: 'dashboard.ver', ruta: '/dashboard' },
    { permiso: 'dashboard-local.ver', ruta: '/dashboard-local' },
    { permiso: 'establecimientos.ver', ruta: '/establecimientos' },
    { permiso: 'cupones.ver', ruta: '/cupones' },
    { permiso: 'clientes.ver', ruta: '/clientes' },
    { permiso: 'usuarios.ver', ruta: '/usuarios' },
    { permiso: 'categorias.ver', ruta: '/catalogos' },
    { permiso: 'reportes.ver', ruta: '/reportes' },
    { permiso: 'solicitudes.ver', ruta: '/solicitudes-cuponera' },
    { permiso: 'pagos.configurar', ruta: '/pagos' },
    { permiso: 'roles.ver', ruta: '/roles' },
    { permiso: 'configuracion.ver', ruta: '/configuracion' },
  ];

  /**
   * Devuelve la primera ruta a la que el usuario tiene acceso según sus
   * permisos, o null si no tiene ninguna. Evita redirigir a rutas
   * prohibidas (causa del bucle de navegación / refresh-token infinito).
   */
  getLandingRoute(): string | null {
    const permisos = this.getPermisos();
    const match = this.routesByPermission.find((r) => permisos.includes(r.permiso));
    return match ? match.ruta : null;
  }
}
