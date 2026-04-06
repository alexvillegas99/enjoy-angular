import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AlertService } from '../../../../core/services/alert.service';
import { RolesService } from '../../../../core/services/roles.service';

@Component({
  standalone: true,
  selector: 'app-listado-roles',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './listado-roles.html',
})
export class ListadoRoles {
  private svc = inject(RolesService);
  private router = inject(Router);
  private alert = inject(AlertService);

  loading = false;
  roles: any[] = [];

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.svc.listar().subscribe({
      next: (res) => {
        this.roles = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.alert.error('Error', 'No se pudo cargar los roles.');
      },
    });
  }

  nuevo() {
    this.router.navigate(['/roles/nuevo']);
  }

  editar(id: string) {
    this.router.navigate(['/roles', id]);
  }

  async eliminar(rol: any) {
    if (rol.esSistema) {
      this.alert.error('Error', 'No se puede eliminar un rol de sistema.');
      return;
    }

    const ok = await this.alert.confirm({
      title: 'Eliminar rol',
      text: `Se eliminará el rol "${rol.nombre}". Esta acción no se puede revertir.`,
    });

    if (!ok) return;

    this.svc.eliminar(rol._id).subscribe({
      next: () => {
        this.alert.success('Rol eliminado');
        this.cargar();
      },
      error: (err: any) => {
        this.alert.error('Error', err?.error?.message ?? 'No se pudo eliminar.');
      },
    });
  }
}
