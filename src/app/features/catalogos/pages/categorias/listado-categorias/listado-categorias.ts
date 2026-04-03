import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AlertService } from '../../../../../core/services/alert.service';
import { CategoriasService } from '../../../../../services/categorias.service';
interface CategoriaForm {
  nombre: string;
  descripcion: string;
  icono: string;
  estado: boolean;
}

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './listado-categorias.html',
})
export class ListadoCategorias implements OnInit {
  private categoriasSrv = inject(CategoriasService);
  private alert = inject(AlertService);

  categorias: any[] = [];

  modalAbierto = false;
  editando = false;
  idEditando: string | null = null;

  form: CategoriaForm  = {
    nombre: '',
    descripcion: '',
    icono: '',
    estado: true,
  };

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.categoriasSrv.listar().subscribe(res => this.categorias = res);
  }

  abrirCrear() {
    this.editando = false;
    this.idEditando = null;
    this.form = { nombre: '', descripcion: '', icono: '', estado: true };
    this.modalAbierto = true;
  }

  editar(c: any) {
    this.editando = true;
    this.idEditando = c._id;
    this.form = { ...c };
    this.modalAbierto = true;
  }

  guardar() {
    const req = this.editando
      ? this.categoriasSrv.actualizar(this.idEditando!, this.form)
      : this.categoriasSrv.crear(this.form);

    req.subscribe({
      next: () => {
        this.alert.success(this.editando ? 'Categoría actualizada' : 'Categoría creada');
        this.modalAbierto = false;
        this.cargar();
      },
      error: err => {
        this.alert.error('Error', err?.error?.message || 'No se pudo guardar');
      }
    });
  }

  toggleEstado(c: any) {
    const req = c.estado
      ? this.categoriasSrv.desactivar(c._id)
      : this.categoriasSrv.activar(c._id);

    req.subscribe(() => this.cargar());
  }

  async eliminar(c: any) {
    const ok = await this.alert.confirm({
      title: 'Eliminar categoría',
      text: `¿Eliminar "${c.nombre}"?`,
      confirmText: 'Eliminar',
    });

    if (!ok) return;

    this.categoriasSrv.eliminar(c._id).subscribe(() => {
      this.alert.success('Categoría eliminada');
      this.cargar();
    });
  }
}
