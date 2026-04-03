import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { LucideAngularModule } from 'lucide-angular';
import { AlertService } from '../../../../core/services/alert.service';
import { SecureStorageService } from '../../../../core/services/secure-storage.service';
import { OtpService } from '../../../../services/otp.service';
import { LocalStorageKeys } from '../../../../core/constants/localstorage';

@Component({
  selector: 'app-validacion-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './validacion-otp.html',
})
export class ValidacionOtp implements OnInit {
  private storage = inject(SecureStorageService);
  private alert = inject(AlertService);
  private otps = inject(OtpService);
  institution = environment.institution;
  data!: any;
  titulo!: string;
  subtitulo!: string;
  mensaje!: string;
  tiempoRestante = 300; // 5 minutos
  intervalId: any;
  expirado = false;

  otp: string[] = Array(5).fill('');
  maxReenvios = 2;
  reenviosRealizados = 0;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.data = this.route.snapshot.data;

    this.titulo = this.data.titulo;
    this.subtitulo = this.data.subtitulo;
    this.mensaje = this.data.mensaje;
  }

  iniciarContador() {
    this.expirado = false;
    this.tiempoRestante = 300;

    clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      if (this.tiempoRestante > 0) {
        this.tiempoRestante--;
      } else {
        this.expirado = true;
        clearInterval(this.intervalId);
      }
    }, 1000);
  }
  get tiempoFormateado(): string {
    const minutos = Math.floor(this.tiempoRestante / 60);
    const segundos = this.tiempoRestante % 60;

    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  }

  ngOnInit() {
    const correo = this.storage.getString(
      LocalStorageKeys.RECUPERACION_CONTRASENA,
    );

    if (!correo) {
      this.alert
        .error('Sesión inválida', 'No se encontró información de recuperación.')
        .then(() => {
          this.router.navigate(['/auth/login']);
        });
      return;
    }

    this.otps.generate(correo).subscribe({
      next: () => {
        this.iniciarContador();
      },
      error: () => {
        this.alert.error(
          'Error',
          'No pudimos enviar el código de verificación.',
        );
      },
    });
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');

    this.otp[index] = value;
    input.value = value;

    // avanzar automáticamente
    if (value && index < this.otp.length - 1) {
      const next = input.nextElementSibling as HTMLInputElement;
      next?.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace') {
      // si hay valor, solo limpiar
      if (this.otp[index]) {
        this.otp[index] = '';
        input.value = '';
        return;
      }

      // si está vacío, retroceder
      if (index > 0) {
        const prev = input.previousElementSibling as HTMLInputElement;
        prev?.focus();
        this.otp[index - 1] = '';
      }
    }
  }

  continuar() {
    if (this.expirado) {
      this.alert.warning(
        'Código expirado',
        'El código OTP ha expirado. Solicita uno nuevo.',
      );
      return;
    }

    const codigoOtp = this.otp.join('');
    const correo = this.storage.getString(
      LocalStorageKeys.RECUPERACION_CONTRASENA,
    );

    if (!correo) {
      this.alert.error('Error', 'Sesión inválida.');
      return;
    }

    this.otps.verify(correo, codigoOtp).subscribe({
      next: () => {
        this.router.navigate([this.data.siguiente]);
      },
      error: () => {
        this.alert.error(
          'Código inválido',
          'El código ingresado no es correcto o ha expirado.',
        );
      },
    });
  }
  reenviar() {
    const correo = this.storage.getString(
      LocalStorageKeys.RECUPERACION_CONTRASENA,
    );

    if (!correo) return;

    if (this.reenviosRealizados >= this.maxReenvios) {
      this.alert
        .warning(
          'Límite alcanzado',
          'Has superado el número máximo de intentos. Inicia nuevamente el proceso.',
        )
        .then(() => {
          this.storage.delete(LocalStorageKeys.RECUPERACION_CONTRASENA);
          this.router.navigate(['/auth/recuperacion']);
        });
      return;
    }

    this.otps.generate(correo).subscribe({
      next: () => {
        this.reenviosRealizados++;
        this.iniciarContador();

        this.alert.info(
          'Código reenviado',
          `Te quedan ${this.maxReenvios - this.reenviosRealizados} intentos disponibles.`,
        );
      },
      error: () => {
        this.alert.error('Error', 'No pudimos reenviar el código.');
      },
    });
  }

  async volver() {
    const salir = await this.alert.confirmExit();
    if (salir) {
      this.router.navigate([this.data.anterior]);
    }
  }
}
