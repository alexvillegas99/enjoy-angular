import { AuthService } from './../../features/auth/services/auth';
import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AlertService } from '../../core/services/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard-header.html',
})
export class DashboardHeader {
  irAperfil() {
    this.router.navigate(['dashboard-local/perfil']);
  }
  constructor(
    private readonly auth: AuthService,
    private readonly alert: AlertService,
    private readonly router: Router,
  ) {
   const user = this.auth.user;

this.nombre = user.nombre;

this.ultimaConexion = user.ultimaConexion
  ? new Intl.DateTimeFormat('es-EC', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(user.ultimaConexion))
  : '—';
  }

  nombre = '';
  ultimaConexion = '';
  expanded: any;

  toggle() {
    this.expanded = !this.expanded;
  }

  menuAbierto = false;

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  async logout() {
    const ok = await this.alert.confirm({
      title: 'Cerrar sesión',
      text: '¿Seguro que deseas salir?',
      confirmText: 'Sí, salir',
      cancelText: 'Cancelar',
      icon: 'warning',
    });

    if (!ok) return;

    this.auth.logout();
  }
  @HostListener('document:click', ['$event'])
  handleClick(event: any) {
    const clickedInside = event.target.closest('.relative');
    if (!clickedInside) this.menuAbierto = false;
  }
}
