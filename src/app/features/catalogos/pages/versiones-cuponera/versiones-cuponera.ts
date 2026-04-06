import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { debounceTime, Subject } from 'rxjs';
import { AlertService } from '../../../../core/services/alert.service';
import {
  VersionCuponeraService,
  VersionCuponera,
} from '../../../../services/version-cuponera.service';
import { CiudadesService } from '../../../../services/ciudad.service';

@Component({
  selector: 'app-versiones-cuponera',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './versiones-cuponera.html',
})
export class VersionesCuponera implements OnInit {
  private service = inject(VersionCuponeraService);
  private alert = inject(AlertService);
  private ciudadesService = inject(CiudadesService);
  versiones: VersionCuponera[] = [];
  loading = false;

  filtroNombre = '';
  filtroEstado: '' | 'true' | 'false' = '';

  private search$ = new Subject<void>();

  ngOnInit() {
    this.search$.pipe(debounceTime(300)).subscribe(() => this.cargar());

    this.cargar();
    this.cargarCiudades();
  }
  cargarCiudades() {
    this.loadingCiudades = true;
    this.ciudadesService.obtenerParaPromociones().subscribe({
      next: (res) => {
        this.ciudades = res;
        this.loadingCiudades = false;
      },
      error: () => (this.loadingCiudades = false),
    });
  }
  ciudades: any[] = [];
  loadingCiudades = false;

  cargar() {
    this.loading = true;

    const estado =
      this.filtroEstado === '' ? undefined : this.filtroEstado === 'true';

    this.service.buscarPorNombre(this.filtroNombre).subscribe({
      next: (res) => {
        this.versiones = res;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  onBuscar() {
    this.search$.next();
  }

  toggleEstado(v: VersionCuponera) {
    const req = v.estado
      ? this.service.desactivar(v._id)
      : this.service.activar(v._id);

    req.subscribe(() => this.cargar());
  }

  async eliminar(v: VersionCuponera) {
    const ok = await this.alert.confirm({
      title: 'Eliminar versión',
      text: `¿Eliminar "${v.nombre}"?`,
      confirmText: 'Eliminar',
    });

    if (!ok) return;

    this.service.eliminar(v._id).subscribe(() => {
      this.alert.success('Versión eliminada');
      this.cargar();
    });
  }

  modalAbierto = false;
  editando = false;
  idEditando: string | null = null;

  form: any = {
    nombre: '',
    precio: '',
    descripcion: '',
  };


  // ===== ACCIONES =====
  abrirCrear() {
    this.editando = false;
    this.idEditando = null;
    this.form = {
      nombre: '',
      descripcion: '',
      ciudadesDisponibles: [],
    };
    this.modalAbierto = true;
  }

editar(v: any) {
  this.editando = true;
  this.idEditando = v._id;

  // Mapear nombres → IDs
  const ids = this.ciudades
    .filter(c => v.ciudadesDisponibles?.includes(c.nombre))
    .map(c => c._id);

  this.form = {
    nombre: v.nombre,
    descripcion: v.descripcion ?? '',
    precio: v.precio ?? '',
    ciudadesDisponibles: ids,
  };

  this.modalAbierto = true;
}



  cerrarModal() {
    this.modalAbierto = false;
  }

 toggleCiudad(id: string) {
  const idx = this.form.ciudadesDisponibles.indexOf(id);
  idx >= 0
    ? this.form.ciudadesDisponibles.splice(idx, 1)
    : this.form.ciudadesDisponibles.push(id);
}


 guardar() {
  const payload = {
    nombre: this.form.nombre,
    descripcion: this.form.descripcion,
    precio: this.form.precio,
    ciudadesDisponibles: this.form.ciudadesDisponibles,
  };

  const req = this.editando
    ? this.service.actualizar(this.idEditando!, payload)
    : this.service.crear(payload);

  req.subscribe({
    next: () => {
      this.alert.success(
        'Guardado exitoso',
        this.editando
          ? 'La versión fue actualizada correctamente'
          : 'La versión fue creada correctamente',
      );
      this.modalAbierto = false;
      this.cargar();
    },
    error: (err) => {
      const mensaje =
        Array.isArray(err?.error?.message?.message)
          ? err.error.message.message.join('\n')
          : err?.error?.message?.message ||
            err?.error?.message ||
            'Ocurrió un error inesperado';

      this.alert.error('No se pudo guardar', mensaje);
    },
  });
}

}
