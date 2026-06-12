import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { EstablecimientosService } from '../../../../services/establecimientos.service';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { AlertService } from '../../../../core/services/alert.service';

interface Establecimiento {
  _id: string;
  nombre: string;
  email: string;
  estado: boolean;
  ciudades: string[];
  categorias: string[];
  promedioCalificacion: number;
  detallePromocion?: {
    title?: string;
    imageUrl?: string;
    logoUrl?: string;
  };
  /** Usuario que creó el establecimiento (populado por el backend). */
  usuarioCreacion?: {
    _id: string;
    nombre: string;
    email?: string;
    rol?: string;
  } | null;
  createdAt?: string;
}

@Component({
  selector: 'app-listado-establecimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './listado-establecimientos.html',
})
export class ListadoEstablecimientos implements OnInit {
  private srv = inject(EstablecimientosService);
  private router = inject(Router);
  private perms = inject(PermissionsService);
  private alert = inject(AlertService);

  togglingId: string | null = null;

  get puedeCrear(): boolean {
    return this.perms.hasPermission('establecimientos.crear');
  }

  /** Activar/desactivar desde la lista: solo administradores. */
  get puedeActivar(): boolean {
    return this.perms.hasPermission('dashboard.ver');
  }

  async toggleEstado(est: Establecimiento, ev?: Event) {
    ev?.stopPropagation();
    if (this.togglingId) return;
    const activar = !est.estado;
    const ok = await this.alert.confirm({
      title: activar ? 'Activar establecimiento' : 'Desactivar establecimiento',
      text: activar
        ? `"${est.nombre}" volverá a mostrarse a los clientes.`
        : `"${est.nombre}" dejará de mostrarse a los clientes.`,
      confirmText: activar ? 'Activar' : 'Desactivar',
      icon: activar ? 'question' : 'warning',
    });
    if (!ok) return;
    this.togglingId = est._id;
    this.srv.update(est._id, { estado: activar }).subscribe({
      next: () => {
        est.estado = activar;
        this.togglingId = null;
        this.alert.success(
          activar ? 'Activado' : 'Desactivado',
          `"${est.nombre}" se actualizó correctamente.`,
        );
      },
      error: (e) => {
        this.togglingId = null;
        this.alert.error(
          'Error',
          e?.error?.message || 'No se pudo actualizar el estado.',
        );
      },
    });
  }

  // data
  establecimientos: Establecimiento[] = [];

  // ui state
  cargando = false;
  busqueda = '';

  // pagination
  page = 1;
  limit = 12;
  total = 0;
  pages = 0;

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando = true;

    this.srv
      .listar({
        page: this.page,
        limit: this.limit,
        q: this.busqueda || undefined,
      })
      .subscribe({
        next: (res) => {
          this.establecimientos = res.items;
          this.total = res.total;
          this.pages = res.pages;
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
        },
      });
  }

  buscar() {
    this.page = 1;
    this.cargar();
  }

  siguiente() {
    if (this.page < this.pages) {
      this.page++;
      this.cargar();
    }
  }

  anterior() {
    if (this.page > 1) {
      this.page--;
      this.cargar();
    }
  }

  nuevo() {
    this.router.navigate(['/establecimientos/nuevo']);
  }

  ver(id: string) {
    this.router.navigate(['/establecimientos', id]);
  }

  editar(id: string) {
    this.router.navigate(['/establecimientos', id, 'editar']);
  }
}
