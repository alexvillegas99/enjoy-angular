import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AlertService } from '../../../../../core/services/alert.service';
import { ProvinciasService } from '../../../../../services/provincia.service';

@Component({
  selector: 'app-provincias',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './listado-provincias.html',
})
export class ListadoProvincias implements OnInit {
  private svc = inject(ProvinciasService);
  private alert = inject(AlertService);

  provincias: any[] = [];
  filtroNombre = '';

  modalAbierto = false;
  editando = false;
  idEditando: string | null = null;

  form: { nombre: string; codigo: string } = { nombre: '', codigo: '' };

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.svc
      .listar({ q: this.filtroNombre || undefined })
      .subscribe((res) => (this.provincias = res ?? []));
  }

  onBuscar() {
    this.cargar();
  }

  abrirCrear() {
    this.editando = false;
    this.idEditando = null;
    this.form = { nombre: '', codigo: '' };
    this.modalAbierto = true;
  }

  editar(p: any) {
    this.editando = true;
    this.idEditando = p._id;
    this.form = { nombre: p.nombre, codigo: p.codigo ?? '' };
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  toggleEstado(p: any) {
    const req = p.estado ? this.svc.desactivar(p._id) : this.svc.activar(p._id);
    req.subscribe(() => this.cargar());
  }

  guardar() {
    if (!this.form.nombre?.trim()) {
      this.alert.warning('Falta el nombre', 'Ingresa el nombre de la provincia.');
      return;
    }
    const req = this.editando
      ? this.svc.actualizar(this.idEditando!, this.form)
      : this.svc.crear(this.form);
    req.subscribe({
      next: () => {
        this.alert.success(this.editando ? 'Provincia actualizada' : 'Provincia creada');
        this.modalAbierto = false;
        this.cargar();
      },
      error: (err) => {
        this.alert.error('Error', err?.error?.message || 'No se pudo guardar');
      },
    });
  }

  async eliminar(p: any) {
    const ok = await this.alert.confirm({
      title: 'Eliminar provincia',
      text: `¿Eliminar ${p.nombre}?`,
      confirmText: 'Eliminar',
    });
    if (!ok) return;
    this.svc.eliminar(p._id).subscribe(() => {
      this.alert.success('Provincia eliminada');
      this.cargar();
    });
  }
}
