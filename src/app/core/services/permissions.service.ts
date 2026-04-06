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
}
