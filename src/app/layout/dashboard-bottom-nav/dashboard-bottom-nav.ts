import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import {
  SidebarItem,
  SIDEBAR_MENU_ADMIN_MOBILE,
  SIDEBAR_MENU_ADMIN_LOCAL_MOBILE,
  SIDEBAR_MENU_FULL,
} from '../../core/constants/sidebar.config';
import { SecureStorageService } from '../../core/services/secure-storage.service';

@Component({
  selector: 'app-dashboard-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './dashboard-bottom-nav.html',
})
export class DashboardBottomNav implements OnInit {

  menu: SidebarItem[] = [];

  constructor(private storage: SecureStorageService) {}

  ngOnInit(): void {
    const user = this.storage.getJson<any>('user');
    const permisos: string[] = user?.permisos ?? [];

    if (permisos.length > 0) {
      // El catálogo ahora soporta grupos; para el bottom-nav móvil aplanamos
      // y nos quedamos solo con items mobile + dedupe por ruta. 'Soporte'
      // aparece 2 veces en el catálogo con permisos distintos para matchear
      // tanto admin como admin-local; mostramos la primera que coincida.
      const flat: SidebarItem[] = [];
      const recurse = (items: SidebarItem[]) => {
        for (const i of items) {
          if (i.children) recurse(i.children);
          else flat.push(i);
        }
      };
      recurse(SIDEBAR_MENU_FULL);

      const filtrados = flat.filter(
        (item) =>
          item.mobile &&
          !!item.route &&
          (!item.permission || permisos.includes(item.permission)),
      );
      const vistos = new Set<string>();
      this.menu = filtrados.filter((item) => {
        const route = item.route as string;
        if (vistos.has(route)) return false;
        vistos.add(route);
        return true;
      });
    } else {
      // Legacy: fallback por rol string
      if (user?.rol === 'admin') {
        this.menu = SIDEBAR_MENU_ADMIN_MOBILE;
      }
      if (user?.rol === 'admin-local') {
        this.menu = SIDEBAR_MENU_ADMIN_LOCAL_MOBILE;
      }
    }
  }
}
