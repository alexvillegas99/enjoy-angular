import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AlertService } from '../../../../core/services/alert.service';
import { ClientesService } from '../../../../services/cliente.service';

@Component({
  standalone: true,
  selector: 'app-listado-clientes',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './listado-clientes.html',
})
export class ListadoClientes {

  private svc = inject(ClientesService);
  private router = inject(Router);
  private alert = inject(AlertService);

  loading = false;

  clientes: any[] = [];
  total = 0;

  filtros = {
    q: '',
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
        this.clientes = res.data ?? [];
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
    this.router.navigate(['/clientes', id, 'editar']);
  }

  async toggleEstado(cliente: any) {

    const ok = await this.alert.confirm({
      title: cliente.estado ? 'Desactivar cliente' : 'Activar cliente',
    });

    if (!ok) return;

    this.svc.update(cliente._id, { estado: !cliente.estado })
      .subscribe(() => {
        this.buscar();
      });
  }

  get totalPaginas() {
    return Math.ceil(this.total / this.filtros.limit);
  }
}
