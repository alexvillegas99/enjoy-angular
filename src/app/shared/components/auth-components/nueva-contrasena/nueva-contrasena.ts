import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { LUCIDE_ICONS } from '../../../../core/icons/lucide-icons';
import { LucideAngularModule } from 'lucide-angular';
import { AlertService } from '../../../../core/services/alert.service';
import { SecureStorageService } from '../../../../core/services/secure-storage.service';
import { UsuariosService } from '../../../../services/usuario.service';
import { LocalStorageKeys } from '../../../../core/constants/localstorage';

@Component({
  selector: 'app-nueva-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './nueva-contrasena.html',
})
export class NuevaContrasena {
  private usuarios = inject(UsuariosService);
  private storage = inject(SecureStorageService);
  institution = environment.institution;
  data: any;

  showPassword = false;
  showConfirmPassword = false;

  password = '';
  confirmPassword = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private alert: AlertService,
  ) {
    this.data = this.route.snapshot.data;
  }

  // reglas bancarias
  get rules() {
    return {
      length: this.password.length >= 8,
      upper: /[A-Z]/.test(this.password),
      lower: /[a-z]/.test(this.password),
      number: /\d/.test(this.password),
      special: /[@$!%*?&#]/.test(this.password),
      match: this.password && this.password === this.confirmPassword,
    };
  }

  get isValid() {
    const r = this.rules;
    return r.length && r.upper && r.lower && r.number && r.special && r.match;
  }

  continuar() {
    if (!this.isValid) return;

    const email = this.storage.getString(
      LocalStorageKeys.RECUPERACION_CONTRASENA,
    );

    if (!email) {
      this.alert.error(
        'Sesión inválida',
        'No se encontró información de recuperación.',
      );
      return;
    }

    this.usuarios
      .actualizarContraseniaRecuperacion(email, this.password)
      .subscribe({
        next: () => {
          this.storage.delete(LocalStorageKeys.RECUPERACION_CONTRASENA);

          this.router.navigate([this.data.siguiente]);
        },
        error: () => {
          this.alert.error(
            'Error',
            'No pudimos actualizar la contraseña. Intenta nuevamente.',
          );
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
