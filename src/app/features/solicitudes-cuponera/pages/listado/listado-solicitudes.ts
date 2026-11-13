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

  // Id de la solicitud que se está procesando (evita doble click en aprobar/rechazar)
  procesandoId: string | null = null;

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
    if (this.procesandoId) return; // ya hay una operación en curso
    this.procesandoId = sol._id;

    this.svc
      .actualizarEstado(sol._id, { estado: 'APROBADO' })
      .subscribe({
        next: () => {
          this.procesandoId = null;
          this.alert.success('Aprobada', 'La solicitud fue aprobada exitosamente.');
          this.buscar();
        },
        error: (e) => {
          this.procesandoId = null;
          const msg = e?.error?.message || 'No se pudo aprobar la solicitud.';
          this.alert.error('Error', msg);
          this.buscar();
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
    if (this.procesandoId) return; // ya hay una operación en curso
    this.procesandoId = sol._id;

    const data: any = { estado: 'RECHAZADO' };
    if (nota) data.notaAdmin = nota;

    this.svc.actualizarEstado(sol._id, data).subscribe({
      next: () => {
        this.procesandoId = null;
        this.alert.success('Rechazada', 'La solicitud fue rechazada.');
        this.notaAdminMap[sol._id] = '';
        this.buscar();
      },
      error: (e) => {
        this.procesandoId = null;
        const msg = e?.error?.message || 'No se pudo rechazar la solicitud.';
        this.alert.error('Error', msg);
        this.buscar();
      },
    });
  }

  getBadgeClasses(estado: string): string {
    // Badges con buen contraste tanto en dark como en light.
    switch (estado) {
      case 'PENDIENTE':
        return 'badge-pendiente';
      case 'APROBADO':
        return 'badge-aprobado';
      case 'RECHAZADO':
        return 'badge-rechazado';
      default:
        return 'badge-neutro';
    }
  }

  /** Precio neto que recibe el negocio: precio - descuento - comisión. */
  netoNegocio(sol: any): number {
    const precio = Number(sol?.cuponeraPrecio) || 0;
    const desc = Number(sol?.montoDescuento) || 0;
    const com = Number(sol?.montoComision) || 0;
    return Math.max(0, precio - desc - com);
  }

  /** Lo que efectivamente pagó/transfirió el cliente (precio - descuento). */
  pagadoPorCliente(sol: any): number {
    const precio = Number(sol?.cuponeraPrecio) || 0;
    const desc = Number(sol?.montoDescuento) || 0;
    const final = Number(sol?.montoFinal) || (precio - desc);
    return final > 0 ? final : Math.max(0, precio - desc);
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
