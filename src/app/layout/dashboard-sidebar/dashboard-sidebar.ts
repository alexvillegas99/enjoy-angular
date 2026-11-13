import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  SidebarItem,
  SIDEBAR_MENU_ADMIN,
  SIDEBAR_MENU_ADMIN_LOCAL,
  SIDEBAR_MENU_FULL,
} from '../../core/constants/sidebar.config';
import { SecureStorageService } from '../../core/services/secure-storage.service';
import { SidebarStore } from '../../core/services/sidebar-store';

const STORAGE_KEY = 'sidebar-expanded-v1';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './dashboard-sidebar.html',
})
export class DashboardSidebar implements OnInit {
  expanded = false;
  institucion = environment.institution;
  menu: SidebarItem[] = [];

  /** Grupos expandidos por label. */
  expandedGroups = new Set<string>();

  store = inject(SidebarStore);
  router = inject(Router);

  constructor(private storage: SecureStorageService) {}

  ngOnInit(): void {
    const user = this.storage.getJson<any>('user');
    const permisos: string[] = user?.permisos ?? [];

    if (permisos.length > 0) {
      this.menu = this._filtrarMenu(SIDEBAR_MENU_FULL, permisos);
    } else {
      // Legacy: fallback por rol string (sin grupos)
      if (user?.rol === 'admin') {
        this.menu = SIDEBAR_MENU_ADMIN;
      }
      if (user?.rol === 'admin-local') {
        this.menu = SIDEBAR_MENU_ADMIN_LOCAL;
      }
    }

    // Restaurar estado de expansión (sessionStorage) + auto-expandir el
    // grupo que contenga la ruta activa.
    this._restoreExpanded();
    this._autoExpandForUrl(this.router.url);

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => this._autoExpandForUrl((e as NavigationEnd).urlAfterRedirects));
  }

  /**
   * Filtra recursivamente por permisos:
   * - Items planos: deben tener permission válido (o ninguno).
   * - Grupos: solo se incluyen si al menos un hijo pasa el filtro.
   * - Dedupe por route (Soporte aparece 2 veces en el catálogo con permisos
   *   distintos para que matchee tanto admin como admin-local).
   */
  private _filtrarMenu(items: SidebarItem[], permisos: string[]): SidebarItem[] {
    const vistos = new Set<string>();
    const out: SidebarItem[] = [];
    for (const item of items) {
      if (item.children) {
        const hijos = this._filtrarMenu(item.children, permisos);
        if (hijos.length > 0) {
          out.push({ ...item, children: hijos });
        }
      } else {
        if (item.permission && !permisos.includes(item.permission)) continue;
        if (item.route) {
          if (vistos.has(item.route)) continue;
          vistos.add(item.route);
        }
        out.push(item);
      }
    }
    return out;
  }

  toggleGroup(label: string) {
    if (this.expandedGroups.has(label)) {
      this.expandedGroups.delete(label);
    } else {
      this.expandedGroups.add(label);
    }
    this._persistExpanded();
  }

  isGroupOpen(label: string): boolean {
    return this.expandedGroups.has(label);
  }

  /** Marca si algún hijo del grupo está en la URL activa (para resaltar la cabecera). */
  isGroupActive(group: SidebarItem, url: string): boolean {
    return !!group.children?.some((c) => c.route && url.startsWith(c.route));
  }

  private _autoExpandForUrl(url: string) {
    for (const item of this.menu) {
      if (item.children && this.isGroupActive(item, url)) {
        this.expandedGroups.add(item.label);
      }
    }
    this._persistExpanded();
  }

  private _restoreExpanded() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const arr: string[] = JSON.parse(raw);
      this.expandedGroups = new Set(arr);
    } catch {}
  }

  private _persistExpanded() {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...this.expandedGroups]),
      );
    } catch {}
  }

  toggle() {
    this.expanded = !this.expanded;
  }

  closeMobile() {
    this.store.close();
  }
}
