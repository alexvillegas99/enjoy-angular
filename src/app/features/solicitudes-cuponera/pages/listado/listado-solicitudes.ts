import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { SolicitudCuponeraService } from '../../../../services/solicitud-cuponera.service';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-listado-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './listado-solicitudes.html',
})
export class ListadoSolicitudes implements OnInit {
  private svc = inject(SolicitudCuponeraService);
  private alert = inject(AlertService);

  loading = false;
  solicitudes: any[] = [];
  total = 0;
  pages = 0;

  filtros = {
    estado: '',
    page: 1,
    limit: 10,
  };

  // Modal de imagen
  imagenAmpliada: string | null = null;

  // Nota admin para rechazo
  notaAdminMap: Record<string, string> = {};

  ngOnInit() {
    this.buscar();
  }

  buscar() {
    this.loading = true;
    const params: any = {
      page: this.filtros.page,
      limit: this.filtros.limit,
    };
    if (this.filtros.estado) {
      params.estado = this.filtros.estado;
    }

    this.svc.listar(params).subscribe({
      next: (res) => {
        this.solicitudes = res.items ?? [];
        this.total = res.total ?? 0;
        this.pages = res.pages ?? 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.alert.error('Error', 'No se pudieron cargar las solicitudes.');
      },
    });
  }

  cambiarPagina(page: number) {
    this.filtros.page = page;
    this.buscar();
  }

  abrirImagen(url: string) {
    this.imagenAmpliada = url;
  }

  cerrarImagen() {
    this.imagenAmpliada = null;
  }

  async aprobar(sol: any) {
    const ok = await this.alert.confirm({
      title: 'Aprobar solicitud',
      text: `Se aprobara la solicitud de "${sol.nombreCliente}" para la cuponera "${sol.cuponeraNombre}".`,
      confirmText: 'Aprobar',
      icon: 'question',
    });
    if (!ok) return;

    this.svc
      .actualizarEstado(sol._id, { estado: 'APROBADO' })
      .subscribe({
        next: () => {
          this.alert.success('Aprobada', 'La solicitud fue aprobada exitosamente.');
          this.buscar();
        },
        error: () => {
          this.alert.error('Error', 'No se pudo aprobar la solicitud.');
        },
      });
  }

  async rechazar(sol: any) {
    const nota = this.notaAdminMap[sol._id]?.trim() || '';

    const ok = await this.alert.confirm({
      title: 'Rechazar solicitud',
      text: nota
        ? `Se rechazara con nota: "${nota}"`
        : 'Se rechazara esta solicitud sin nota adicional.',
      confirmText: 'Rechazar',
      icon: 'warning',
    });
    if (!ok) return;

    const data: any = { estado: 'RECHAZADO' };
    if (nota) data.notaAdmin = nota;

    this.svc.actualizarEstado(sol._id, data).subscribe({
      next: () => {
        this.alert.success('Rechazada', 'La solicitud fue rechazada.');
        this.notaAdminMap[sol._id] = '';
        this.buscar();
      },
      error: () => {
        this.alert.error('Error', 'No se pudo rechazar la solicitud.');
      },
    });
  }

  getBadgeClasses(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-amber-100 text-amber-700';
      case 'APROBADO':
        return 'bg-emerald-100 text-emerald-700';
      case 'RECHAZADO':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
