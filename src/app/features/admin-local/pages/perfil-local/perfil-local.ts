import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UsuariosService } from '../../../../services/usuario.service';
import { AlertService } from '../../../../core/services/alert.service';
import { AuthService } from '../../../auth/services/auth';

@Component({
  selector: 'app-perfil-local',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './perfil-local.html',
})
export class PerfilLocal implements OnInit {

  private service = inject(UsuariosService);
  private alert = inject(AlertService);
  private auth = inject(AuthService);

  loading = true;
  data: any = null;

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.loading = true;

    try {
      this.data = this.auth.user ?? null; // 👈 FIX correcto
    } catch {
      this.alert.error('Error', 'No se pudo cargar el perfil');
    } finally {
      this.loading = false;
    }
  }

  // UI helpers
  getEstadoClass(): string {
    return this.data?.estado
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
  }

  getRol(): string {
    return this.data?.rol?.toUpperCase?.() ?? '-';
  }

  getPromosExtra(): number {
    return this.data?.detallePromocionesExtra?.length || 0;
  }

  toggleEstado() {
    if (!this.data?._id) return;

    this.service.update(this.data._id, {
      estado: !this.data.estado,
    }).subscribe({
      next: () => {
        this.alert.success('Estado actualizado');
        this.cargarPerfil();
      },
      error: () => {
        this.alert.error('Error', 'No se pudo actualizar el estado.');
      },
    });
  }
}
