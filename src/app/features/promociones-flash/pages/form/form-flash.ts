import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AlertService } from '../../../../core/services/alert.service';
import {
  CreateFlashPayload,
  PromocionesFlashService,
  PromocionFlash,
  TipoFlash,
} from '../../../../services/promociones-flash.service';

@Component({
  selector: 'app-form-flash',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './form-flash.html',
})
export class FormFlash implements OnInit {
  private svc = inject(PromocionesFlashService);
  private alert = inject(AlertService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  id: string | null = null;
  loading = false;
  saving = false;

  /** Datos del form (las claves matchean el DTO del back). */
  form: CreateFlashPayload & { estado?: PromocionFlash['estado'] } = {
    titulo: '',
    descripcion: '',
    tipo: 'anuncio' as TipoFlash,
    etiqueta: '',
    canjeable: false,
    limitePorCliente: 1,
  };

  /** Preview de la imagen (data URL o URL S3 ya cargada). */
  previewUrl: string | null = null;
  /** ISO datetime-local string sin Z, p.ej. "2026-06-20T14:30" */
  venceLocal = '';

  readonly tipos: { value: TipoFlash; label: string; desc: string }[] = [
    { value: 'anuncio', label: 'Anuncio', desc: 'Solo informativo, sin canje' },
    { value: 'nuevo_producto', label: 'Producto nuevo', desc: 'Lanzamiento o novedad' },
    { value: 'descuento', label: 'Descuento', desc: 'Precio especial / 2x1' },
    { value: 'evento', label: 'Evento', desc: 'Fecha o noche especial' },
  ];

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) this.cargar();
    else this.inicializarFechaVence(48); // 48h por defecto al crear
  }

  private inicializarFechaVence(horas: number) {
    const d = new Date(Date.now() + horas * 3600000);
    // formato YYYY-MM-DDTHH:mm
    const pad = (n: number) => String(n).padStart(2, '0');
    this.venceLocal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  cargar() {
    if (!this.id) return;
    this.loading = true;
    this.svc.mias().subscribe({
      next: (r) => {
        const found = (r.data || []).find((x) => x._id === this.id);
        if (!found) {
          this.alert.error('Error', 'No encontramos esta promoción.');
          this.router.navigate(['/promociones-flash']);
          return;
        }
        this.form = {
          titulo: found.titulo,
          descripcion: found.descripcion || '',
          tipo: found.tipo,
          etiqueta: found.etiqueta || '',
          precio: found.precio ?? undefined,
          precioAntes: found.precioAntes ?? undefined,
          canjeable: found.canjeable,
          cupos: found.cupos ?? undefined,
          limitePorCliente: found.limitePorCliente,
        };
        this.previewUrl = found.imagenUrl;
        if (found.vence) {
          const d = new Date(found.vence);
          const pad = (n: number) => String(n).padStart(2, '0');
          this.venceLocal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.alert.error('Error', 'No pudimos cargar la promoción.');
      },
    });
  }

  onImagenSeleccionada(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      this.alert.warning('Imagen muy grande', 'Elegí una imagen menor a 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
      this.form.imagenBase64 = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  quitarImagen() {
    this.previewUrl = null;
    this.form.imagenBase64 = undefined;
    this.form.imagenUrl = undefined;
  }

  cancelar() {
    this.router.navigate(['/promociones-flash']);
  }

  guardar() {
    if (!this.form.titulo?.trim()) {
      this.alert.warning('Falta título', 'Pone un título para tu promoción.');
      return;
    }
    if (!this.previewUrl) {
      this.alert.warning('Falta imagen', 'Las promociones flash necesitan una imagen.');
      return;
    }
    if (!this.venceLocal) {
      this.alert.warning('Falta vencimiento', 'Indicá hasta cuándo está activa.');
      return;
    }
    const venceDate = new Date(this.venceLocal);
    if (venceDate.getTime() <= Date.now()) {
      this.alert.warning('Fecha inválida', 'La fecha de vencimiento debe estar en el futuro.');
      return;
    }

    const payload: CreateFlashPayload = {
      ...this.form,
      vence: venceDate.toISOString(),
    };
    // si no es canjeable, limpiamos campos derivados
    if (!payload.canjeable) {
      delete payload.cupos;
      payload.limitePorCliente = 1;
    }

    this.saving = true;
    const obs = this.id
      ? this.svc.actualizar(this.id, payload)
      : this.svc.crear(payload);

    obs.subscribe({
      next: () => {
        this.alert.success(
          this.id ? 'Actualizada' : 'Creada',
          this.id
            ? 'La promoción se actualizó correctamente.'
            : 'Tu promoción flash ya está activa.',
        );
        this.router.navigate(['/promociones-flash']);
      },
      error: (e) => {
        this.saving = false;
        this.alert.error(
          'Error',
          e?.error?.message || 'No se pudo guardar la promoción.',
        );
      },
    });
  }
}
