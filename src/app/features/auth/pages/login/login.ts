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

  private handleLoginSuccess() {
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
  }

  validarUsuario() {
    this.validating = true;

    this.authService.login(this.username, this.password).subscribe({
      next: () => this.handleLoginSuccess(),
      error: (error) => {
        this.validating = false;
        console.log(error)
        this.alert.error('Error', error.error.message.message);
      },
    });
  }

  loginConGoogle() {
    this.validating = true;

    this.authService.loginWithGoogle().subscribe({
      next: () => this.handleLoginSuccess(),
      error: (error) => {
        this.validating = false;
        console.log(error);
        const msg = error?.error?.message?.message ?? error?.message ?? 'Error al iniciar sesión con Google';
        this.alert.error('Error', msg);
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
