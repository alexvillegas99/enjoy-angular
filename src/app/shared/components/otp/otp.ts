import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../../../environments/environment';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-validacion-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './otp.html',
})
export class Otp {
  institution = environment.institution;
  data!: any;
  titulo!: string;
  subtitulo!: string;
  mensaje!: string;

  otp: string[] = Array(6).fill('');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private alert: AlertService
  ) {
    this.data = this.route.snapshot.data;
    console.log('Datos de ruta OTP:', this.data);
    this.titulo = this.data.titulo;
    this.subtitulo = this.data.subtitulo;
    this.mensaje = this.data.mensaje;
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
    const codigoOtp = this.otp.join('');
    console.log('OTP ingresado:', codigoOtp);
    console.log('Redirigiendo a:', this.data.siguiente);

    this.router.navigate([this.data.siguiente]);
  }
  async volver() {
    const salir = await this.alert.confirmExit();
    console.log('Salir sin guardar:', this.data.anterior);
    if (salir) {
      this.router.navigate([this.data.anterior]);
    }
  }
}
