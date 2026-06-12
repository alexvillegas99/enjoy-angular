import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CampanasService } from '../../../../services/campanas.service';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-listado-campanas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './listado-campanas.html',
})
export class ListadoCampanas implements OnInit {
  private svc = inject(CampanasService);
  private alert = inject(AlertService);
  private router = inject(Router);

  loading = true;
  items: any[] = [];
  estadoFiltro = '';

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.svc
      .listar({ page: 1, limit: 50, estado: this.estadoFiltro || undefined })
      .subscribe({
        next: (r) => {
          this.items = r.items || [];
          this.loading = false;
        },
        error: () => {
          this.items = [];
          this.loading = false;
        },
      });
  }

  estadoPill(estado: string): string {
    switch (estado) {
      case 'ENVIADA':
        return 'pill-green';
      case 'PROGRAMADA':
        return 'pill-blue';
      case 'BORRADOR':
        return 'pill';
      case 'CANCELADA':
        return 'pill';
      case 'FALLIDA':
        return 'pill-red';
      default:
        return 'pill';
    }
  }

  segmentoTexto(c: any): string {
    switch (c.tipoSegmento) {
      case 'TODOS':
        return 'Todos los clientes';
      case 'PROVINCIA':
        return 'Por provincia';
      case 'CIUDAD':
        return 'Por ciudad';
      case 'CATEGORIA':
        return 'Por categoría';
      case 'TOPIC':
        return c.topicCustom || 'Topic custom';
      default:
        return c.tipoSegmento;
    }
  }

  async enviar(c: any) {
    if (c.estado === 'ENVIADA') return;
    this.svc.enviar(c._id).subscribe({
      next: (upd) => {
        Object.assign(c, upd);
        this.alert.success('Enviada', 'Campaña enviada correctamente.');
      },
      error: (e) =>
        this.alert.error('Error', e?.error?.message || 'No se pudo enviar.'),
    });
  }

  async cancelar(c: any) {
    if (c.estado === 'ENVIADA') return;
    const ok = await this.alert.confirm({
      title: 'Cancelar campaña',
      text: `"${c.titulo}" no será enviada.`,
      confirmText: 'Sí, cancelar',
      cancelText: 'Volver',
      icon: 'warning',
    });
    if (!ok) return;
    this.svc.cancelar(c._id).subscribe({
      next: (upd) => Object.assign(c, upd),
      error: (e) =>
        this.alert.error('Error', e?.error?.message || 'No se pudo cancelar.'),
    });
  }

  async eliminar(c: any) {
    const ok = await this.alert.confirm({
      title: 'Eliminar campaña',
      text: `"${c.titulo}" se borrará junto con su historial de entregas. Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Volver',
      icon: 'warning',
    });
    if (!ok) return;
    this.svc.eliminar(c._id).subscribe({
      next: () => {
        this.items = this.items.filter((x) => x._id !== c._id);
        this.alert.success('Eliminada', 'La campaña fue borrada.');
      },
      error: (e) =>
        this.alert.error('Error', e?.error?.message || 'No se pudo eliminar.'),
    });
  }

  editar(c: any) {
    this.router.navigate(['/notificaciones', c._id]);
  }
}
