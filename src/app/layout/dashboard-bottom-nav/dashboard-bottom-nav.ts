import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import {
  SidebarItem,
  SIDEBAR_MENU_ADMIN,
  SIDEBAR_MENU_ADMIN_LOCAL,
  SIDEBAR_MENU_ADMIN_MOBILE,
  SIDEBAR_MENU_ADMIN_LOCAL_MOBILE
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

    if (user?.rol === 'admin') {
      this.menu = SIDEBAR_MENU_ADMIN_MOBILE;
    }

    if (user?.rol === 'admin-local') {
      this.menu = SIDEBAR_MENU_ADMIN_LOCAL_MOBILE;
    }
  }
}
