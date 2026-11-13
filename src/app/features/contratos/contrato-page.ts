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

  /** Selfie capturado por cámara (base64 data URL). */
  selfieBase64: string | null = null;

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
          'No pudimos cargar el estado del contrato. Recarga la página.',
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
        'Elige una foto menor a 5 MB.',
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
      !!this.selfieBase64 &&
      !!this.cedulaBase64 &&
      this.aceptaTerminos &&
      !!this.datosLocal.ruc.trim() &&
      !!this.datosLocal.direccion.trim() &&
      !!this.datosLocal.representanteLegal.trim() &&
      !!this.datosLocal.cedulaRepresentante.trim() &&
      !!this.datosLocal.celular.trim()
    );
  }

  /** Abre el modal de captura de selfie y guarda el resultado. */
  async capturarSelfie(): Promise<void> {
    const r = await this._capturarSelfieWeb();
    if (r) this.selfieBase64 = r;
  }

  quitarSelfie() {
    this.selfieBase64 = null;
  }

  async firmar(): Promise<void> {
    if (!this.puedeFirmar) {
      this.alert.warning(
        'Faltan datos',
        'Completa los datos del local, lee todo el contrato, sube tu cédula y acepta los términos.',
      );
      return;
    }
    // 1) Pedir OTP al back (lo envía por email)
    this.saving = true;
    let emailDest = '';
    try {
      const r = await this.svc.solicitarOtp().toPromise();
      emailDest = r?.email ?? '';
    } catch (e: any) {
      this.saving = false;
      this.alert.error(
        'No se pudo enviar el código',
        e?.error?.message || 'Intenta en unos segundos.',
      );
      return;
    }
    this.saving = false;

    // 2) Pedir el código al usuario via SweetAlert
    const Swal = (await import('sweetalert2')).default;
    const result = await Swal.fire({
      title: 'Código de firma enviado',
      html: `
        <p style="text-align:left; color:#a0aab8; font-size:13px; margin-bottom:14px;">
          Te enviamos un código de <b>6 dígitos</b> a <b>${emailDest}</b>.
          Ingresalo para confirmar tu firma.
        </p>
        <input id="swal-otp" inputmode="numeric" maxlength="6"
               class="swal2-input"
               style="text-align:center; letter-spacing:10px; font-size:28px;
                      font-weight:800; margin:0;"
               placeholder="------" />
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar firma',
      cancelButtonText: 'Cancelar',
      showDenyButton: true,
      denyButtonText: 'Reenviar código',
      customClass: {
        popup: 'enjoy-swal-popup',
        title: 'enjoy-swal-title',
        confirmButton: 'enjoy-swal-confirm',
        cancelButton: 'enjoy-swal-cancel',
        denyButton: 'enjoy-swal-cancel',
      },
      preConfirm: () => {
        const v = (document.getElementById('swal-otp') as HTMLInputElement)
          ?.value?.trim();
        if (!v || !/^\d{6}$/.test(v)) {
          Swal.showValidationMessage('Ingresa los 6 dígitos.');
          return false;
        }
        return v;
      },
    });

    // El usuario pidió reenviar
    if (result.isDenied) {
      try {
        await this.svc.solicitarOtp().toPromise();
        this.alert.success('Código reenviado', 'Revisa tu email.');
      } catch (_) {
        this.alert.error('Error', 'No se pudo reenviar.');
      }
      // Recursivo para que pueda volver a ingresar
      return this.firmar();
    }
    if (!result.isConfirmed || !result.value) return;
    const otp = String(result.value);

    // 3) Aceptar con OTP + selfie (ya capturado antes).
    this.saving = true;
    this.svc
      .aceptar({
        cedulaBase64: this.cedulaBase64!,
        selfieBase64: this.selfieBase64 ?? undefined,
        datosLocal: this.datosLocal,
        aceptaTerminos: true,
        otp,
      })
      .subscribe({
        next: () => {
          this.alert.success(
            'Contrato firmado',
            'Tu contrato fue registrado con firma simple verificada por OTP. Ya tienes acceso al panel.',
          );
          this.router.navigate(['/dashboard-local']);
        },
        error: (e) => {
          this.saving = false;
          this.alert.error(
            'No se pudo firmar',
            e?.error?.message || 'Reintenta en unos segundos.',
          );
        },
      });
  }

  /**
   * Modal con preview de cámara frontal + botón "Capturar".
   * Devuelve un dataURL base64 o null si el usuario canceló.
   *
   * No usa ML Kit (eso vive en la app móvil); en web es un selfie simple
   * con la cámara del navegador — suficiente como anexo de identidad.
   */
  private async _capturarSelfieWeb(): Promise<string | null> {
    const Swal = (await import('sweetalert2')).default;
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 480, height: 360 },
        audio: false,
      });
    } catch (_) {
      this.alert.error(
        'Sin acceso a la cámara',
        'Permite el acceso a la cámara desde el navegador para continuar.',
      );
      return null;
    }

    const html = `
      <p style="text-align:left; color:#a0aab8; font-size:13px; margin-bottom:10px;">
        Mira a la cámara y pulsa <b>Capturar</b>. La foto queda como anexo del contrato.
      </p>
      <video id="swal-selfie-video" autoplay playsinline muted
             style="width:100%; max-width:380px; border-radius:14px; background:#000;
                    transform: scaleX(-1);"></video>
      <canvas id="swal-selfie-canvas" style="display:none;"></canvas>
    `;

    return await new Promise<string | null>((resolve) => {
      Swal.fire({
        title: 'Selfie del representante',
        html,
        showCancelButton: true,
        confirmButtonText: 'Capturar',
        cancelButtonText: 'Cancelar',
        customClass: {
          popup: 'enjoy-swal-popup',
          title: 'enjoy-swal-title',
          confirmButton: 'enjoy-swal-confirm',
          cancelButton: 'enjoy-swal-cancel',
        },
        didOpen: () => {
          const v = document.getElementById(
            'swal-selfie-video',
          ) as HTMLVideoElement;
          if (v && stream) v.srcObject = stream;
        },
        preConfirm: () => {
          const v = document.getElementById(
            'swal-selfie-video',
          ) as HTMLVideoElement;
          const c = document.getElementById(
            'swal-selfie-canvas',
          ) as HTMLCanvasElement;
          if (!v || !c) return false;
          c.width = v.videoWidth;
          c.height = v.videoHeight;
          const ctx = c.getContext('2d');
          if (!ctx) return false;
          // Invertir horizontalmente para coincidir con preview.
          ctx.translate(c.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(v, 0, 0, c.width, c.height);
          return c.toDataURL('image/jpeg', 0.85);
        },
      }).then((r) => {
        // Cerrar stream pase lo que pase.
        stream?.getTracks().forEach((t) => t.stop());
        if (r.isConfirmed && typeof r.value === 'string') {
          resolve(r.value);
        } else {
          resolve(null);
        }
      });
    });
  }
}
