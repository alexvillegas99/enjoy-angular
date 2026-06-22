import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AlertService } from '../../../../core/services/alert.service';
import {
  EstadoFlash,
  PromocionesFlashService,
  PromocionFlash,
} from '../../../../services/promociones-flash.service';

@Component({
  selector: 'app-listado-flash',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './listado-flash.html',
})
export class ListadoFlash implements OnInit {
  private svc = inject(PromocionesFlashService);
  private alert = inject(AlertService);
  private router = inject(Router);

  loading = true;
  items: PromocionFlash[] = [];
  activas = 0;
  max = 5;
  estadoFiltro: '' | EstadoFlash = '';
  togglingId: string | null = null;

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.svc.mias(this.estadoFiltro || undefined).subscribe({
      next: (r) => {
        this.items = r.data || [];
        this.activas = r.activas ?? 0;
        this.max = r.max ?? 5;
        this.loading = false;
      },
      error: () => {
        this.items = [];
        this.loading = false;
      },
    });
  }

  estadoPill(estado: EstadoFlash): string {
    switch (estado) {
      case 'ACTIVA':
        return 'pill pill-green pill-dot';
      case 'PAUSADA':
        return 'pill';
      case 'VENCIDA':
        return 'pill pill-red';
      default:
        return 'pill';
    }
  }

  /** ¿Cuántas horas restan al `vence`? Negativo si ya venció. */
  horasRestantes(p: PromocionFlash): number {
    const dif = new Date(p.vence).getTime() - Date.now();
    return Math.round(dif / 3600000);
  }

  textoRestante(p: PromocionFlash): string {
    const h = this.horasRestantes(p);
    if (h <= 0) return 'Vencida';
    if (h < 24) return `${h}h restantes`;
    const d = Math.round(h / 24);
    return `${d} día${d === 1 ? '' : 's'} restantes`;
  }

  async togglePausa(p: PromocionFlash) {
    if (this.togglingId) return;
    const proximo: EstadoFlash =
      p.estado === 'ACTIVA' ? 'PAUSADA' : 'ACTIVA';
    if (p.estado !== 'ACTIVA' && p.estado !== 'PAUSADA') return;

    const ok = await this.alert.confirm({
      title: proximo === 'PAUSADA' ? 'Pausar promoción' : 'Reactivar promoción',
      text:
        proximo === 'PAUSADA'
          ? `"${p.titulo}" dejará de mostrarse a los clientes hasta que la reactives.`
          : `"${p.titulo}" volverá a aparecer en el feed de los clientes.`,
      confirmText: proximo === 'PAUSADA' ? 'Pausar' : 'Reactivar',
      icon: 'question',
    });
    if (!ok) return;

    this.togglingId = p._id;
    this.svc.actualizar(p._id, { estado: proximo }).subscribe({
      next: (upd) => {
        Object.assign(p, upd);
        this.togglingId = null;
        // recargar para refrescar el contador de "activas"
        this.cargar();
      },
      error: (e) => {
        this.togglingId = null;
        this.alert.error(
          'Error',
          e?.error?.message || 'No se pudo cambiar el estado.',
        );
      },
    });
  }

  async eliminar(p: PromocionFlash) {
    const ok = await this.alert.confirm({
      title: 'Eliminar promoción',
      text: `"${p.titulo}" se borrará. Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      icon: 'warning',
    });
    if (!ok) return;
    this.svc.eliminar(p._id).subscribe({
      next: () => {
        this.items = this.items.filter((x) => x._id !== p._id);
        this.alert.success('Eliminada', 'La promoción fue borrada.');
        this.cargar();
      },
      error: (e) =>
        this.alert.error(
          'Error',
          e?.error?.message || 'No se pudo eliminar.',
        ),
    });
  }

  editar(p: PromocionFlash) {
    this.router.navigate(['/promociones-flash', p._id]);
  }

  nueva() {
    if (this.activas >= this.max) {
      this.alert.warning(
        'Límite alcanzado',
        `Ya tienes ${this.max} promociones activas. Pausa o elimina alguna antes de crear otra.`,
      );
      return;
    }
    this.router.navigate(['/promociones-flash/nueva']);
  }
}
