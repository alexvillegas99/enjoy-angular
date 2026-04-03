import { Component } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../services/auth';
import { AlertService } from '../../../../core/services/alert.service';

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
