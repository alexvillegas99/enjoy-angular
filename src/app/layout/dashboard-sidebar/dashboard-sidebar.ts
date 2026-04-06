import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../../environments/environment';
import {
  SidebarItem,
  SIDEBAR_MENU_ADMIN,
  SIDEBAR_MENU_ADMIN_LOCAL,
  SIDEBAR_MENU_FULL,
} from '../../core/constants/sidebar.config';
import { SecureStorageService } from '../../core/services/secure-storage.service';

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

  constructor(private storage: SecureStorageService) {}

  ngOnInit(): void {
    const user = this.storage.getJson<any>('user');
    const permisos: string[] = user?.permisos ?? [];

    if (permisos.length > 0) {
      // Nuevo: filtrar menú por permisos del usuario
      this.menu = SIDEBAR_MENU_FULL.filter(
        (item) => !item.permission || permisos.includes(item.permission),
      );
    } else {
      // Legacy: fallback por rol string
      if (user?.rol === 'admin') {
        this.menu = SIDEBAR_MENU_ADMIN;
      }
      if (user?.rol === 'admin-local') {
        this.menu = SIDEBAR_MENU_ADMIN_LOCAL;
      }
    }
  }

  toggle() {
    this.expanded = !this.expanded;
  }
}
