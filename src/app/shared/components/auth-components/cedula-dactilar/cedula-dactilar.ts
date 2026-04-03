import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { LucideAngularModule } from 'lucide-angular';
import { UsuariosService } from '../../../../services/usuario.service';
import { SecureStorageService } from '../../../../core/services/secure-storage.service';
import { LocalStorageKeys } from '../../../../core/constants/localstorage';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-cedula-dactilar',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './cedula-dactilar.html',
  styleUrl: './cedula-dactilar.scss',
})
export class CedulaDactilar implements OnInit {
  private svc = inject(UsuariosService);
  private storage = inject(SecureStorageService);
  private alert = inject(AlertService);
  institution = environment.institution;
  data!: any;

  correo = '';

  validating = false;
  correoValidado = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.data = this.route.snapshot.data;
  }

  ngOnInit(): void {
    this.route.data.subscribe((d) => {
      this.data = d;
    });
  }

  validarCorreo() {
    if (!this.correo) {
      this.alert.warning(
        'Correo requerido',
        'Debes ingresar el correo asociado a tu cuenta.',
      );
      return;
    }

    this.validating = true;

    this.svc.buscarPorCorreo(this.correo).subscribe({
      next: (res) => {
        this.validating = false;

        if (!!res) {
          this.storage.setString(
            LocalStorageKeys.RECUPERACION_CONTRASENA,
            this.correo,
          );
          this.validating = false;
          this.continuar();
        } else {
          this.alert.error(
            'Correo no encontrado',
            'El correo ingresado no está registrado en Enjoy.',
          );
        }
      },
      error: () => {
        this.validating = false;
        this.alert.error(
          'Error de validación',
          'No pudimos validar el correo. Intenta nuevamente.',
        );
      },
    });
  }

  continuar() {
    this.router.navigate([this.data.siguiente]);
  }

  volver() {
    this.alert.confirmExit().then((confirmed) => {
      if (confirmed) {
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
