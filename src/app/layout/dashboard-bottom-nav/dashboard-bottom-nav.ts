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
      // Nuevo: filtrar solo items marcados como mobile + dedupe por ruta
      // (ej. 'Soporte' tiene 2 entradas con permisos distintos en el catálogo).
      const filtrados = SIDEBAR_MENU_FULL.filter(
        (item) => item.mobile && (!item.permission || permisos.includes(item.permission)),
      );
      const vistos = new Set<string>();
      this.menu = filtrados.filter((item) => {
        if (vistos.has(item.route)) return false;
        vistos.add(item.route);
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
