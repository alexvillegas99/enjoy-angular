import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { forkJoin } from 'rxjs';
import { PagosAtencionService } from '../../../../services/pagos-atencion.service';
import { AlertService } from '../../../../core/services/alert.service';

/**
 * Cobros que se pagaron pero no terminaron en una cuponera activa:
 *  - En revisión: el proveedor cobró pero monto/moneda/referencia no cuadran.
 *  - Sin cupón: el pago está aprobado pero el cupón no se pudo emitir.
 *  - Solicitudes sin cupón: aprobadas a mano (transferencia) con error al emitir.
 */
@Component({
  selector: 'app-cobros-por-atender',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './cobros-por-atender.html',
})
export class CobrosPorAtender implements OnInit {
  private svc = inject(PagosAtencionService);
  private alert = inject(AlertService);

  loading = false;
  enRevision: any[] = [];
  sinCupon: any[] = [];
  solicitudes: any[] = [];

  /** Nota del admin por pago en revisión (motivo de aprobar/rechazar). */
  notas: Record<string, string> = {};
  procesandoId: string | null = null;

  get total() {
    return this.enRevision.length + this.sinCupon.length + this.solicitudes.length;
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    forkJoin({
      pagos: this.svc.porAtender(),
      solicitudes: this.svc.solicitudesSinCupon(),
    }).subscribe({
      next: ({ pagos, solicitudes }) => {
        const lista = Array.isArray(pagos) ? pagos : [];
        this.enRevision = lista.filter((p) => p.status === 'REVISION');
        this.sinCupon = lista.filter((p) => p.status === 'APROBADO');
        this.solicitudes = Array.isArray(solicitudes) ? solicitudes : [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.alert.error('No se pudo cargar', 'Revisa tu conexión o tus permisos e intenta de nuevo.');
      },
    });
  }

  metodo(p: any) {
    return p.metodo === 'paypal' ? 'PayPal' : 'PayPhone';
  }

  estadoCupon(p: any) {
    switch (p.cuponEstado) {
      case 'ERROR':
        return 'Falló la emisión';
      case 'EMITIENDO':
        return 'Emitiendo…';
      default:
        return 'Pendiente de emitir';
    }
  }

  async aprobar(p: any) {
    const ok = await this.alert.confirm({
      title: 'Aprobar y emitir',
      text: `Confirma que verificaste el cobro de $${Number(p.monto).toFixed(2)} de ${p.nombreCliente || p.emailCliente}. Se emitirá su cuponera.`,
      confirmText: 'Aprobar',
      cancelText: 'Cancelar',
      icon: 'question',
    });
    if (!ok) return;
    this.resolver(p, 'aprobar');
  }

  async rechazar(p: any) {
    const ok = await this.alert.confirm({
      title: 'Rechazar pago',
      text: 'No se emitirá la cuponera. Si el proveedor cobró, el reembolso se hace desde PayPhone o PayPal.',
      confirmText: 'Rechazar',
      cancelText: 'Cancelar',
      icon: 'warning',
    });
    if (!ok) return;
    this.resolver(p, 'rechazar');
  }

  private resolver(p: any, accion: 'aprobar' | 'rechazar') {
    this.procesandoId = p._id;
    this.svc.resolver(p._id, accion, this.notas[p._id]?.trim() || undefined).subscribe({
      next: (r: any) => {
        this.procesandoId = null;
        if (accion === 'aprobar' && r?.cupon !== 'EMITIDO') {
          this.alert.warning('Aprobado sin cupón', 'El pago quedó aprobado pero el cupón no se emitió. Aparece abajo para reintentar.');
        } else {
          this.alert.success(accion === 'aprobar' ? 'Cuponera emitida' : 'Pago rechazado');
        }
        this.cargar();
      },
      error: (e) => {
        this.procesandoId = null;
        this.alert.error('No se pudo resolver', this.mensaje(e));
        this.cargar();
      },
    });
  }

  reemitir(p: any) {
    this.procesandoId = p._id;
    this.svc.reemitir(p._id).subscribe({
      next: (r) => {
        this.procesandoId = null;
        const textos: Record<string, [string, string]> = {
          EMITIDO: ['Cuponera emitida', ''],
          EN_CURSO: ['En curso', 'Otra emisión está en marcha. Recarga en un par de minutos.'],
          ERROR: ['No se pudo emitir', 'Revisa el detalle del error en la tarjeta.'],
        };
        const [t, d] = textos[r?.estado] ?? ['Sin cambios', `Estado: ${r?.estado}`];
        (r?.estado === 'EMITIDO' ? this.alert.success(t, d) : this.alert.warning(t, d));
        this.cargar();
      },
      error: (e) => {
        this.procesandoId = null;
        this.alert.error('No se pudo reintentar', this.mensaje(e));
      },
    });
  }

  reintentarSolicitud(s: any) {
    this.procesandoId = s._id;
    this.svc.reintentarSolicitud(s._id).subscribe({
      next: () => {
        this.procesandoId = null;
        this.alert.success('Cuponera emitida');
        this.cargar();
      },
      error: (e) => {
        this.procesandoId = null;
        this.alert.error('No se pudo emitir', this.mensaje(e));
        this.cargar();
      },
    });
  }

  private mensaje(e: any): string {
    const m = e?.error?.message;
    return typeof m === 'string' ? m : (m?.message ?? 'Intenta de nuevo en unos minutos.');
  }
}
