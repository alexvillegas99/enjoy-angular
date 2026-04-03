import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AlertService } from '../../../../core/services/alert.service';
import { UsuariosService } from '../../../../services/usuario.service';
import { AuthService } from '../../../auth/services/auth';

@Component({
  selector: 'app-usuarios-local',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './usuarios-local.html',
})
export class UsuariosLocal implements OnInit {
  private service = inject(UsuariosService);
  private alert = inject(AlertService);
  private auth = inject(AuthService);

  usuarios: any[] = [];
  loading = false;

  // ✅ modal / form state
  modalAbierto = false;
  modoEdicion = false;
  form: any = this.getEmptyForm();

  // KPI
  total = 0;
  activos = 0;
  inactivos = 0;

  ngOnInit() {
    this.cargar();
  }

  // ================= LOAD =================
  cargar() {
    this.loading = true;

    const id = this.auth.user?._id;

    this.service.obtenerPorLocal(id).subscribe({
      next: (res) => {
        this.usuarios = res.data ?? res;
        this.calcularKpis();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.alert.error('Error', 'No se pudieron cargar los usuarios.');
      },
    });
  }

  calcularKpis() {
    this.total = this.usuarios.length;
    this.activos = this.usuarios.filter((u) => u.estado).length;
    this.inactivos = this.total - this.activos;
  }

  // ================= MODAL =================
  abrirModal() {
    this.modoEdicion = false;
    this.form = this.getEmptyForm();
    this.modalAbierto = true;
  }

  editar(u: any) {
    this.modoEdicion = true;
    this.form = { ...u }; // shallow copy suficiente aquí
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  // ================= CRUD =================
  guardar() {
    if (!this.form.nombre || !this.form.email) {
      this.alert.warning(
        'Campos requeridos',
        'Nombre y email son obligatorios.',
      );
      return;
    }

    this.modoEdicion ? this.actualizar() : this.crear();
  }

  private crear() {
    const id = this.auth.user?._id;
    this.service.create({ ...this.form, usuarioCreacion: id }).subscribe({
      next: () => {
        this.alert.success('Usuario creado correctamente');
        this.postSave();
      },
      error: () => {
        this.alert.error('Error', 'No se pudo crear el usuario.');
      },
    });
  }

  private actualizar() {
    const payload = { ...this.form };
    delete payload.clave; // evitar enviar si no aplica

    this.service.update(this.form._id, payload).subscribe({
      next: () => {
        this.alert.success('Usuario actualizado');
        this.postSave();
      },
      error: () => {
        this.alert.error('Error', 'No se pudo actualizar el usuario.');
      },
    });
  }

  toggleEstado(u: any) {
    this.service.update(u._id, { estado: !u.estado }).subscribe({
      next: () => this.cargar(),
      error: () => this.alert.error('Error', 'No se pudo actualizar estado.'),
    });
  }

  // ================= HELPERS =================
  private postSave() {
    this.cerrarModal();
    this.cargar();
  }

  private getEmptyForm() {
    return {
      nombre: '',
      email: '',
      identificacion: '',
      telefono: '',
      rol: 'staff',
      estado: true,
    };
  }

  modalConfirmarEstado = false;
  usuarioSeleccionado: any = null;

  abrirConfirmacion(u: any) {
    this.usuarioSeleccionado = u;
    this.modalConfirmarEstado = true;
  }

  cerrarConfirmacion() {
    this.modalConfirmarEstado = false;
    this.usuarioSeleccionado = null;
  }

  confirmarCambioEstado() {
    const u = this.usuarioSeleccionado;

    this.service.update(u._id, { estado: !u.estado }).subscribe({
      next: () => {
        this.alert.success('Estado actualizado');
        this.cerrarConfirmacion();
        this.cargar();
      },
      error: () => {
        this.alert.error('Error', 'No se pudo actualizar estado.');
      },
    });
  }
}
