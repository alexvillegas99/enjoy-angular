import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { HistorialEstablecimientosService } from '../../../../services/historial-establecimientos.service';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-listado-historial',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './listado-historial.html',
})
export class ListadoHistorial implements OnInit {
  private svc = inject(HistorialEstablecimientosService);
  private alert = inject(AlertService);

  loading = false;
  items: any[] = [];
  total = 0;
  pages = 0;

  filtroEstado = '';
  page = 1;
  limit = 15;

  /** ID del registro actualmente expandido para ver el diff */
  expandidoId: string | null = null;

  ngOnInit() {
    this.buscar();
  }

  buscar() {
    this.loading = true;
    this.svc
      .listar({ estado: this.filtroEstado || undefined, page: this.page, limit: this.limit })
      .subscribe({
        next: (res) => {
          this.items = res.items ?? [];
          this.total = res.total ?? 0;
          this.pages = res.pages ?? 0;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.alert.error('Error', 'No se pudo cargar el historial.');
        },
      });
  }

  cambiarEstado(estado: string) {
    this.filtroEstado = estado;
    this.page = 1;
    this.buscar();
  }

  cambiarPagina(p: number) {
    this.page = p;
    this.buscar();
  }

  toggleDetalle(id: string) {
    this.expandidoId = this.expandidoId === id ? null : id;
  }

  async aprobar(item: any) {
    const ok = await this.alert.confirm({
      title: 'Aprobar cambio',
      text: `Los cambios de "${item.editadoPorNombre}" en "${item.nombreEstablecimiento}" se conservarán.`,
      confirmText: 'Aprobar',
      icon: 'question',
    });
    if (!ok) return;

    this.svc.aprobar(item._id).subscribe({
      next: () => {
        this.alert.success('Aprobado', 'El cambio fue aprobado.');
        this.buscar();
      },
      error: () => this.alert.error('Error', 'No se pudo aprobar el cambio.'),
    });
  }

  async revertir(item: any) {
    const ok = await this.alert.confirm({
      title: 'Revertir cambio',
      text: `Se restaurarán los datos anteriores de "${item.nombreEstablecimiento}". Esta acción no se puede deshacer.`,
      confirmText: 'Revertir',
      icon: 'warning',
    });
    if (!ok) return;

    this.svc.revertir(item._id).subscribe({
      next: () => {
        this.alert.success('Revertido', 'Los datos fueron restaurados.');
        this.buscar();
      },
      error: () => this.alert.error('Error', 'No se pudo revertir el cambio.'),
    });
  }

  /** Devuelve las claves del diff excluyendo claves vacías o técnicas */
  getCampos(obj: Record<string, any>): string[] {
    return Object.keys(obj).filter(
      (k) => !['__v', '_id', 'createdAt', 'updatedAt'].includes(k),
    );
  }

  formatValor(v: any): string {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'object') return JSON.stringify(v, null, 2);
    return String(v);
  }

  badgeClass(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'bg-amber-100 text-amber-700';
      case 'aprobado': return 'bg-emerald-100 text-emerald-700';
      case 'revertido': return 'bg-rose-100 text-rose-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  formatFecha(f: string): string {
    if (!f) return '—';
    return new Date(f).toLocaleDateString('es-EC', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
