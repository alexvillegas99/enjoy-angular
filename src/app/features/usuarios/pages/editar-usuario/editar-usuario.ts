import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosService } from '../../../../services/usuario.service';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  standalone: true,
  selector: 'app-editar-usuario',
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-usuario.html',
})
export class EditarUsuario {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(UsuariosService);
  private alert = inject(AlertService);

  modo: 'crear' | 'editar' = 'crear';
  id!: string;

  loading = false;

  original: any = {};

  model: any = {
    nombre: '',
    email: '',
    identificacion: '',
    rol: 'staff',
    estado: true,
    clave: '',
    confirmarClave: '',
  };

  ngOnInit() {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.modo = 'editar';
      this.id = id;
      this.cargar();
    }

  }

  cargar() {

    this.loading = true;

    this.svc.obtener(this.id).subscribe({

      next: (res) => {

        this.original = {
          nombre: res.nombre,
          email: res.email,
          identificacion: res.identificacion,
          rol: res.rol,
          estado: res.estado,
        };

        this.model = {
          ...this.model,
          ...this.original,
          clave: '',
          confirmarClave: '',
        };

        this.loading = false;

      },

      error: () => {

        this.loading = false;

        this.alert.error(
          'Error',
          'No se pudo cargar el usuario.',
        );

      },

    });

  }

  async guardar() {

    if (!this.model.nombre || !this.model.email || !this.model.identificacion) {

      this.alert.warning(
        'Campos requeridos',
        'Completa la información obligatoria.',
      );

      return;

    }

    if (this.model.clave) {

      if (this.model.clave !== this.model.confirmarClave) {

        this.alert.warning(
          'Contraseña no coincide',
          'Verifica la confirmación.',
        );

        return;

      }

    }

    const ok = await this.alert.confirm({
      title: this.modo === 'editar'
        ? 'Actualizar usuario'
        : 'Crear usuario',
      text: '¿Confirmas la operación?',
    });

    if (!ok) return;

    this.loading = true;

    if (this.modo === 'crear') {

      const payload = {
        nombre: this.model.nombre,
        email: this.model.email,
        identificacion: this.model.identificacion,
        rol: this.model.rol,
        estado: this.model.estado,
        clave: this.model.clave,
      };

      this.svc.create(payload).subscribe({

        next: async () => {

          this.loading = false;

          await this.alert.success('Usuario creado');

          this.router.navigate(['/usuarios']);

        },

        error: (err) => {

          this.loading = false;

          this.alert.error(
            'Error',
            err?.error?.message || 'No se pudo crear.',
          );

        },

      });

    }

    if (this.modo === 'editar') {

      const payload: any = {};

      const campos = [
        'nombre',
        'email',
        'identificacion',
        'rol',
        'estado',
      ];

      campos.forEach((campo) => {

        if (this.model[campo] !== this.original[campo]) {

          payload[campo] = this.model[campo];

        }

      });

      if (this.model.clave?.trim()) {

        payload.clave = this.model.clave;

      }

      if (!Object.keys(payload).length) {

        this.loading = false;

        this.alert.info(
          'Sin cambios',
          'No se detectaron modificaciones.',
        );

        return;

      }

      this.svc.update(this.id, payload).subscribe({

        next: async () => {

          this.loading = false;

          await this.alert.success('Usuario actualizado');

          this.router.navigate(['/usuarios']);

        },

        error: (err) => {

          this.loading = false;

          this.alert.error(
            'Error',
            err?.error?.message || 'No se pudo actualizar.',
          );

        },

      });

    }

  }

  volver() {

    this.router.navigate(['/usuarios']);

  }

}
