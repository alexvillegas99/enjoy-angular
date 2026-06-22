import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AlertService } from '../../core/services/alert.service';
import {
  ContratoEstado,
  ContratoService,
} from '../../services/contrato.service';

@Component({
  selector: 'app-contrato-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './contrato-page.html',
})
export class ContratoPage implements OnInit, AfterViewInit {
  private svc = inject(ContratoService);
  private alert = inject(AlertService);
  private router = inject(Router);

  @ViewChild('contratoBox') contratoBox?: ElementRef<HTMLDivElement>;

  loading = true;
  saving = false;
  estado: ContratoEstado | null = null;

  /** Datos del local (pre-rellenados o vacíos para que complete). */
  datosLocal = {
    ruc: '',
    direccion: '',
    representanteLegal: '',
    cedulaRepresentante: '',
    estadoCivilRepresentante: 'soltero',
    celular: '',
  };

  /** Foto de cédula en base64 (data URL). */
  cedulaPreviewUrl: string | null = null;
  cedulaBase64: string | null = null;

  /** Solo se habilita al scrollear todo el texto del contrato. */
  scrollCompleto = false;
  aceptaTerminos = false;

  ngOnInit() {
    this.svc.miEstado(true).subscribe({
      next: (r) => {
        this.estado = r;
        // Si ya aceptó, redirige al panel.
        if (r.aceptado) {
          this.router.navigate(['/']);
          return;
        }
        if (r.datosLocal) {
          this.datosLocal.ruc = r.datosLocal.ruc ?? '';
          this.datosLocal.direccion = r.datosLocal.direccion ?? '';
          this.datosLocal.representanteLegal =
            r.datosLocal.representanteLegal ?? '';
          this.datosLocal.cedulaRepresentante =
            r.datosLocal.cedulaRepresentante ?? '';
          this.datosLocal.estadoCivilRepresentante =
            r.datosLocal.estadoCivilRepresentante ?? 'soltero';
          this.datosLocal.celular = r.datosLocal.celular ?? '';
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.alert.error(
          'Error',
          'No pudimos cargar el estado del contrato. Recargá la página.',
        );
      },
    });
  }

  ngAfterViewInit() {
    // Listener del scroll dentro del box del contrato.
    setTimeout(() => {
      const el = this.contratoBox?.nativeElement;
      if (!el) return;
      const checkScroll = () => {
        const llegoAlFinal =
          el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
        if (llegoAlFinal && !this.scrollCompleto) {
          this.scrollCompleto = true;
        }
      };
      el.addEventListener('scroll', checkScroll);
      // Si el contenido cabe sin scroll, marcar como completo.
      if (el.scrollHeight <= el.clientHeight + 8) {
        this.scrollCompleto = true;
      }
    }, 200);
  }

  onArchivoCedula(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      this.alert.warning(
        'Imagen muy grande',
        'Elegí una foto menor a 5 MB.',
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.cedulaPreviewUrl = dataUrl;
      this.cedulaBase64 = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  quitarCedula() {
    this.cedulaPreviewUrl = null;
    this.cedulaBase64 = null;
  }

  get puedeFirmar(): boolean {
    return (
      this.scrollCompleto &&
      !!this.cedulaBase64 &&
      this.aceptaTerminos &&
      !!this.datosLocal.ruc.trim() &&
      !!this.datosLocal.direccion.trim() &&
      !!this.datosLocal.representanteLegal.trim() &&
      !!this.datosLocal.cedulaRepresentante.trim() &&
      !!this.datosLocal.celular.trim()
    );
  }

  async firmar() {
    if (!this.puedeFirmar) {
      this.alert.warning(
        'Faltan datos',
        'Completá los datos del local, leé todo el contrato, subí tu cédula y aceptá los términos.',
      );
      return;
    }
    this.saving = true;
    this.svc
      .aceptar({
        cedulaBase64: this.cedulaBase64!,
        datosLocal: this.datosLocal,
        aceptaTerminos: true,
      })
      .subscribe({
        next: () => {
          this.alert.success(
            'Contrato firmado',
            'Tu contrato fue registrado. Ya tenés acceso al panel.',
          );
          // Refrescar cache y navegar al home admin-local.
          this.router.navigate(['/dashboard-local']);
        },
        error: (e) => {
          this.saving = false;
          this.alert.error(
            'No se pudo firmar',
            e?.error?.message || 'Reintentá en unos segundos.',
          );
        },
      });
  }
}
