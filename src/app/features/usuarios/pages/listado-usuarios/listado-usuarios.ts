import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AlertService } from '../../../../core/services/alert.service';
import { UsuariosService } from '../../../../services/usuario.service';

@Component({
  standalone: true,
  selector: 'app-listado-usuarios',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './listado-usuarios.html',
})
export class ListadoUsuarios {

  private svc = inject(UsuariosService);
  private router = inject(Router);
  private alert = inject(AlertService);

  loading = false;

  usuarios: any[] = [];
  total = 0;

  filtros = {
    q: '',
    rol: '',
    estado: '',
    page: 1,
    limit: 10,
  };

  ngOnInit() {
    this.buscar();
  }

  buscar() {
    this.loading = true;

    this.svc.listarAdmin(this.filtros).subscribe({
      next: (res) => {
        this.usuarios = res.data ?? [];
        this.total = res.total ?? 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.alert.error('Error', 'No se pudo cargar la información.');
      }
    });
  }

  cambiarPagina(page: number) {
    this.filtros.page = page;
    this.buscar();
  }

  editar(id: string) {
    this.router.navigate(['/usuarios', id]);
  }
  nuevo() {
    this.router.navigate(['/usuarios/nuevo']);
  }

  async eliminar(id: string) {

    const ok = await this.alert.confirm({
      title: 'Eliminar usuario',
      text: 'Esta acción no se puede revertir.',
    });

    if (!ok) return;

    this.svc.delete(id).subscribe(() => {
      this.alert.success('Eliminado');
      this.buscar();
    });
  }

  async toggleEstado(usuario: any) {

    const ok = await this.alert.confirm({
      title: usuario.estado ? 'Desactivar usuario' : 'Activar usuario',
    });

    if (!ok) return;

    this.svc.update(usuario._id, { estado: !usuario.estado })
      .subscribe(() => {
        this.buscar();
      });
  }

  get totalPaginas() {
    return Math.ceil(this.total / this.filtros.limit);
  }
}
