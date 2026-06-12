import { Injectable, signal } from '@angular/core';

/**
 * Estado del menú lateral en mobile.
 * Compartido entre `dashboard-header` (botón hamburguesa) y
 * `dashboard-sidebar` / `sidebar-mobile-drawer` (overlay).
 */
@Injectable({ providedIn: 'root' })
export class SidebarStore {
  readonly mobileOpen = signal(false);

  open() {
    this.mobileOpen.set(true);
  }
  close() {
    this.mobileOpen.set(false);
  }
  toggle() {
    this.mobileOpen.update((v) => !v);
  }
}
