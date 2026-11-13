import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import Swal from 'sweetalert2';
import { AlertService } from '../../core/services/alert.service';
import { ClientesService } from '../../services/cliente.service';
import {
  PromotorDefaults,
  PromotorService,
} from '../../services/promotor.service';

interface ClienteRow {
  _id: string;
  nombres?: string;
  apellidos?: string;
  email?: string;
  identificacion?: string;
  telefono?: string;
  isPromotor?: boolean;
  codigoDescuento?: string | null;
  porcentajeDescuento?: number | null;
  porcentajeComision?: number | null;
  saldoPromotor?: number;
}

@Component({
  selector: 'app-promotores-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './promotores-page.html',
})
export class PromotoresPage implements OnInit {
  private clientesSvc = inject(ClientesService);
  private promotorSvc = inject(PromotorService);
  private alert = inject(AlertService);
  private router = inject(Router);

  defaults: PromotorDefaults = { descuento: 20, comision: 20 };

  // ── BUSCADOR (acción principal) ──
  busquedaQ = '';
  buscando = false;
  resultados: ClienteRow[] = [];
  busquedaHecha = false;
  /** ID del cliente cuya tarjeta de "parametrizar" está expandida. */
  expandidoId: string | null = null;
  nuevoCodigo = '';
  nuevoPctDescuento: number | null = null;
  nuevoPctComision: number | null = null;
  guardandoActivar = false;

  // ── Tabla de promotores activos (secundaria) ──
  loadingActivos = false;
  promotores: ClienteRow[] = [];

  ngOnInit() {
    this.promotorSvc.defaults().subscribe({
      next: (d) => (this.defaults = d),
      error: () => {},
    });
    this.cargarActivos();
  }

  // ────────── Buscador ──────────
  buscar() {
    const q = this.busquedaQ.trim();
    if (q.length < 2) {
      this.alert.warning(
        'Búsqueda muy corta',
        'Escribí al menos 2 caracteres (nombre, email o cédula).',
      );
      return;
    }
    this.buscando = true;
    this.busquedaHecha = false;
    this.expandidoId = null;
    // Solo no-promotores: queremos sumar gente nueva al programa.
    // Defensivo: si el back aún no aplica el filtro, lo hacemos en el front.
    this.clientesSvc
      .listarAdmin({ q, isPromotor: 'false', page: 1, limit: 50 })
      .subscribe({
      next: (res: any) => {
        const raw: ClienteRow[] = res?.data ?? [];
        this.resultados = raw.filter((c) => c.isPromotor !== true).slice(0, 20);
        this.buscando = false;
        this.busquedaHecha = true;
      },
      error: () => {
        this.buscando = false;
        this.busquedaHecha = true;
        this.alert.error('Error', 'No se pudo buscar.');
      },
    });
  }

  limpiarBusqueda() {
    this.busquedaQ = '';
    this.resultados = [];
    this.busquedaHecha = false;
    this.expandidoId = null;
  }

  /** Click en un resultado: si ya es promotor → edit; si no, despliega form inline. */
  elegir(c: ClienteRow) {
    if (c.isPromotor) {
      this.editar(c);
      return;
    }
    if (this.expandidoId === c._id) {
      this.expandidoId = null;
      return;
    }
    this.expandidoId = c._id;
    this.nuevoCodigo = this._sugerirCodigo(c);
    this.nuevoPctDescuento = this.defaults.descuento;
    this.nuevoPctComision = this.defaults.comision;
  }

  private _sugerirCodigo(c: ClienteRow): string {
    const base = (c.nombres || '').trim().split(/\s+/)[0] || '';
    const clean = base
      .toUpperCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 8);
    return clean ? `${clean}${this.defaults.descuento}` : '';
  }

  async activar(c: ClienteRow) {
    const codigo = (this.nuevoCodigo || '').trim().toUpperCase();
    if (codigo.length < 3) {
      this.alert.warning(
        'Código inválido',
        'Usá entre 3 y 20 caracteres alfanuméricos.',
      );
      return;
    }
    this.guardandoActivar = true;
    this.promotorSvc
      .activar(c._id, {
        codigoDescuento: codigo,
        porcentajeDescuento: this.nuevoPctDescuento,
        porcentajeComision: this.nuevoPctComision,
      })
      .subscribe({
        next: () => {
          this.guardandoActivar = false;
          this.alert.success(
            'Promotor activo',
            `Código "${codigo}" listo para usar.`,
          );
          this.expandidoId = null;
          // marcar en los resultados que ya es promotor
          const r = this.resultados.find((x) => x._id === c._id);
          if (r) {
            r.isPromotor = true;
            r.codigoDescuento = codigo;
            r.porcentajeDescuento = this.nuevoPctDescuento;
            r.porcentajeComision = this.nuevoPctComision;
          }
          this.cargarActivos();
        },
        error: (e) => {
          this.guardandoActivar = false;
          this.alert.error(
            'No se pudo activar',
            e?.error?.message ||
              'Verificá el código (podría ya estar en uso por otro promotor).',
          );
        },
      });
  }

  // ────────── Tabla de promotores activos ──────────
  cargarActivos() {
    this.loadingActivos = true;
    this.clientesSvc
      .listarAdmin({ isPromotor: 'true', page: 1, limit: 200 })
      .subscribe({
        next: (res: any) => {
          // Filtro defensivo en el front: si el back aún no respeta el query
          // isPromotor=true (versión vieja), igual nos quedamos solo con los
          // que tienen el flag explícito en true.
          const raw: ClienteRow[] = res?.data ?? [];
          this.promotores = raw.filter((c) => c.isPromotor === true);
          this.loadingActivos = false;
        },
        error: () => {
          this.loadingActivos = false;
        },
      });
  }

  async editar(p: ClienteRow) {
    const result = await Swal.fire({
      title: `Editar ${p.nombres || ''} ${p.apellidos || ''}`.trim(),
      html: `
        <div style="display:flex; flex-direction:column; gap:10px; text-align:left;">
          <label style="font-size:12px; color:#a0aab8;">Código de descuento</label>
          <input id="swal-cod" class="swal2-input" style="margin:0;"
                 maxlength="20" value="${(p.codigoDescuento ?? '').toString().replace(/"/g, '&quot;')}"
                 placeholder="ej. ANA20" />
          <label style="font-size:12px; color:#a0aab8;">% de descuento al comprador</label>
          <input id="swal-pdesc" type="number" min="0" max="80" class="swal2-input" style="margin:0;"
                 value="${p.porcentajeDescuento ?? ''}" placeholder="${this.defaults.descuento}" />
          <label style="font-size:12px; color:#a0aab8;">% de comisión para el promotor</label>
          <input id="swal-pcom" type="number" min="0" max="80" class="swal2-input" style="margin:0;"
                 value="${p.porcentajeComision ?? ''}" placeholder="${this.defaults.comision}" />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'enjoy-swal-popup',
        title: 'enjoy-swal-title',
        confirmButton: 'enjoy-swal-confirm',
        cancelButton: 'enjoy-swal-cancel',
      },
      preConfirm: () => {
        const cod = (
          (document.getElementById('swal-cod') as HTMLInputElement)?.value || ''
        )
          .trim()
          .toUpperCase();
        const pd = (document.getElementById('swal-pdesc') as HTMLInputElement)
          ?.value;
        const pc = (document.getElementById('swal-pcom') as HTMLInputElement)
          ?.value;
        if (cod.length < 3) {
          Swal.showValidationMessage('Código muy corto');
          return false;
        }
        return {
          codigoDescuento: cod,
          porcentajeDescuento: pd === '' ? null : Number(pd),
          porcentajeComision: pc === '' ? null : Number(pc),
        };
      },
    });
    if (!result.isConfirmed || !result.value) return;
    this.promotorSvc.activar(p._id, result.value as any).subscribe({
      next: () => {
        this.alert.success('Actualizado', 'Cambios guardados.');
        this.cargarActivos();
      },
      error: (e) =>
        this.alert.error(
          'No se pudo guardar',
          e?.error?.message || 'Revisá el código.',
        ),
    });
  }

  async desactivar(p: ClienteRow) {
    const ok = await this.alert.confirm({
      title: 'Desactivar promotor',
      text: `${p.nombres || ''} ${p.apellidos || ''} ya no podrá compartir códigos. El saldo acumulado se mantiene.`,
      confirmText: 'Sí, desactivar',
      icon: 'warning',
    });
    if (!ok) return;
    this.promotorSvc.desactivar(p._id).subscribe({
      next: () => {
        this.alert.success('Desactivado', 'Ya no figura como promotor.');
        this.cargarActivos();
      },
      error: (e) =>
        this.alert.error(
          'Error',
          e?.error?.message || 'No se pudo desactivar.',
        ),
    });
  }

  irAReporte() {
    this.router.navigate(['/reportes/promotores']);
  }

  // ── Helpers ──
  fmtMoneda(v: number | undefined | null): string {
    if (v == null || isNaN(Number(v))) return '$0.00';
    return '$' + Number(v).toFixed(2);
  }

  nombreCliente(c: ClienteRow): string {
    return `${c.nombres || ''} ${c.apellidos || ''}`.trim() || '—';
  }
}
