
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AlertService } from '../../../../../core/services/alert.service';
import { CiudadesService } from '../../../../../services/ciudad.service';

@Component({
  selector: 'app-ciudades',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './listado-ciudades.html',
})
export class ListadoCiudades implements OnInit {
  private ciudadesService = inject(CiudadesService);
  private alert = inject(AlertService);

  ciudades: any[] = [];
  filtroNombre = '';
  filtroEstado: '' | 'true' | 'false' = '';

  // modal
  modalAbierto = false;
  editando = false;
  idEditando: string | null = null;

  form: {
    nombre: string;
    visibleParaRegistro: boolean;
  } = {
    nombre: '',
    visibleParaRegistro: true,
  };

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    const estado =
      this.filtroEstado === ''
        ? undefined
        : this.filtroEstado === 'true';

    this.ciudadesService
      .listar({ q: this.filtroNombre, estado })
      .subscribe((res) => (this.ciudades = res.items));
  }

  onBuscar() {
    this.cargar();
  }

  abrirCrear() {
    this.editando = false;
    this.idEditando = null;
    this.form = { nombre: '', visibleParaRegistro: true };
    this.modalAbierto = true;
  }

  editar(c: any) {
    this.editando = true;
    this.idEditando = c._id;
    this.form = {
      nombre: c.nombre,
      visibleParaRegistro: c.visibleParaRegistro,
    };
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  toggleEstado(c: any) {
    const req = c.estado
      ? this.ciudadesService.desactivar(c._id)
      : this.ciudadesService.activar(c._id);

    req.subscribe(() => this.cargar());
  }

  guardar() {
    const req = this.editando
      ? this.ciudadesService.actualizar(this.idEditando!, this.form)
      : this.ciudadesService.crear(this.form);

    req.subscribe({
      next: () => {
        this.alert.success(
          this.editando ? 'Ciudad actualizada' : 'Ciudad creada',
        );
        this.modalAbierto = false;
        this.cargar();
      },
      error: (err) => {
        const msg =
          err?.error?.message || 'No se pudo guardar la ciudad';
        this.alert.error('Error', msg);
      },
    });
  }

  async eliminar(c: any) {
    const ok = await this.alert.confirm({
      title: 'Eliminar ciudad',
      text: `¿Eliminar ${c.nombre}?`,
      confirmText: 'Eliminar',
    });

    if (!ok) return;

    this.ciudadesService.eliminar(c._id).subscribe(() => {
      this.alert.success('Ciudad eliminada');
      this.cargar();
    });
  }
}
