import { Component, inject } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../services/auth';
import { AlertService } from '../../../../core/services/alert.service';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private alert: AlertService,
  ) {}
  private permService = inject(PermissionsService);

  institution = environment.institution;
  showPassword = false;
  password = '';
  username = '';
  validating = false;
  userValidated = false;

  validarUsuario() {
    this.validating = true;

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        // Validar permiso de acceso web
        if (!this.permService.hasPermission('web.acceso')) {
          this.authService.logout();
          this.validating = false;
          this.alert.error('Acceso denegado', 'No tienes permisos para acceder al panel web.');
          return;
        }

        setTimeout(() => {
          this.validating = false;
          this.router.navigate(['/dashboard']);
        }, 1000);
      },
      error: (error) => {
        this.validating = false;
        console.log(error)
        this.alert.error('Error', error.error.message.message);
      },
    });
  }

  recuperarCredenciales() {
    this.router.navigate(['/auth/recover-password']);
  }
  desbloquearUsuario() {
    this.router.navigate(['/auth/unlock-user']);
  }
  crearUsuario() {
    this.router.navigate(['/auth/create-user']);
  }
  recuperarUsuario() {
    console.log('Navegando a recuperar usuario');
    this.router.navigate(['/auth/recover-user']);
  }
}
