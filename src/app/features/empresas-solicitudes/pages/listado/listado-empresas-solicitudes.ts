import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { EmpresaSolicitudService } from '../../../../services/empresa-solicitud.service';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-listado-empresas-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './listado-empresas-solicitudes.html',
})
export class ListadoEmpresasSolicitudes implements OnInit {
  private svc = inject(EmpresaSolicitudService);
  private alert = inject(AlertService);

  loading = false;
  solicitudes: any[] = [];

  filtros = { estado: '' };

  // Nota admin por solicitud (para rechazo / observación).
  notaAdminMap: Record<string, string> = {};

  // Id en proceso (evita doble click en acciones).
  procesandoId: string | null = null;

  ngOnInit() {
    this.buscar();
  }

  buscar() {
    this.loading = true;
    this.svc.listar(this.filtros.estado || undefined).subscribe({
      next: (res) => {
        this.solicitudes = Array.isArray(res) ? res : (res?.items ?? []);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.alert.error('Error', 'No se pudieron cargar las solicitudes.');
      },
    });
  }

  // ── Acciones ──────────────────────────────────────────────────────────────

  async marcarContactado(sol: any) {
    const ok = await this.alert.confirm({
      title: 'Marcar como contactado',
      text: `¿Marcar la solicitud de "${sol.empresa}" como contactada?`,
      confirmText: 'Marcar contactado',
      icon: 'question',
    });
    if (!ok) return;
    this.patch(sol, { estado: 'CONTACTADO' }, 'Solicitud marcada como contactada.');
  }

  async aprobar(sol: any) {
    const ok = await this.alert.confirm({
      title: 'Aprobar solicitud',
      text: `Se aprobará el acceso de "${sol.empresa}".`,
      confirmText: 'Aprobar',
      icon: 'question',
    });
    if (!ok) return;
    this.patch(sol, { estado: 'APROBADO' }, 'Solicitud aprobada exitosamente.');
  }

  async rechazar(sol: any) {
    const nota = this.notaAdminMap[sol._id]?.trim() || '';
    const ok = await this.alert.confirm({
      title: 'Rechazar solicitud',
      text: nota
        ? `Se rechazará con nota: "${nota}"`
        : 'Se rechazará esta solicitud sin nota adicional.',
      confirmText: 'Rechazar',
      icon: 'warning',
    });
    if (!ok) return;
    const data: any = { estado: 'RECHAZADO' };
    if (nota) data.notaAdmin = nota;
    this.patch(sol, data, 'Solicitud rechazada.');
  }

  async eliminar(sol: any) {
    const ok = await this.alert.confirm({
      title: 'Eliminar solicitud',
      text: `Se eliminará permanentemente la solicitud de "${sol.empresa}". Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      icon: 'warning',
    });
    if (!ok) return;
    if (this.procesandoId) return;
    this.procesandoId = sol._id;
    this.svc.eliminar(sol._id).subscribe({
      next: () => {
        this.procesandoId = null;
        this.alert.success('Eliminada', 'La solicitud fue eliminada.');
        this.buscar();
      },
      error: (e) => {
        this.procesandoId = null;
        this.alert.error('Error', e?.error?.message || 'No se pudo eliminar la solicitud.');
      },
    });
  }

  private patch(sol: any, data: any, okMsg: string) {
    if (this.procesandoId) return;
    this.procesandoId = sol._id;
    this.svc.actualizar(sol._id, data).subscribe({
      next: () => {
        this.procesandoId = null;
        this.alert.success('Listo', okMsg);
        this.notaAdminMap[sol._id] = '';
        this.buscar();
      },
      error: (e) => {
        this.procesandoId = null;
        this.alert.error('Error', e?.error?.message || 'No se pudo actualizar la solicitud.');
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getBadgeClasses(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-amber-100 text-amber-700';
      case 'CONTACTADO':
        return 'bg-sky-100 text-sky-700';
      case 'APROBADO':
        return 'bg-emerald-100 text-emerald-700';
      case 'RECHAZADO':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  abrirWhatsApp(telefono: string) {
    const limpio = (telefono || '').replace(/[^0-9+]/g, '');
    if (!limpio) return;
    window.open(`https://wa.me/${limpio}`, '_blank');
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
