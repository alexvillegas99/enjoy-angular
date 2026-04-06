import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AlertService } from '../../../../core/services/alert.service';
import { RolesService } from '../../../../core/services/roles.service';

@Component({
  standalone: true,
  selector: 'app-editar-rol',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './editar-rol.html',
})
export class EditarRol {
  private svc = inject(RolesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alert = inject(AlertService);

  modo: 'crear' | 'editar' = 'crear';
  loading = false;
  saving = false;
  rolId = '';

  form = {
    nombre: '',
    descripcion: '',
    slug: '',
    permisos: [] as string[],
  };

  esSistema = false;
  gruposPermisos: any[] = [];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.modo = 'editar';
      this.rolId = id;
    }

    this.cargarPermisos();
  }

  cargarPermisos() {
    this.loading = true;

    this.svc.obtenerPermisos().subscribe({
      next: (grupos) => {
        this.gruposPermisos = grupos;

        if (this.modo === 'editar') {
          this.cargarRol();
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
        this.alert.error('Error', 'No se pudo cargar los permisos.');
      },
    });
  }

  cargarRol() {
    this.svc.obtener(this.rolId).subscribe({
      next: (rol) => {
        this.form.nombre = rol.nombre;
        this.form.descripcion = rol.descripcion ?? '';
        this.form.slug = rol.slug;
        this.form.permisos = [...(rol.permisos ?? [])];
        this.esSistema = rol.esSistema ?? false;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.alert.error('Error', 'No se pudo cargar el rol.');
        this.router.navigate(['/roles']);
      },
    });
  }

  tienePermiso(clave: string): boolean {
    return this.form.permisos.includes(clave);
  }

  togglePermiso(clave: string) {
    const idx = this.form.permisos.indexOf(clave);
    if (idx >= 0) {
      this.form.permisos.splice(idx, 1);
    } else {
      this.form.permisos.push(clave);
    }
  }

  toggleGrupo(grupo: any) {
    const claves = grupo.permisos.map((p: any) => p.clave);
    const todosActivos = claves.every((c: string) => this.form.permisos.includes(c));

    if (todosActivos) {
      // Quitar todos del grupo
      this.form.permisos = this.form.permisos.filter((p) => !claves.includes(p));
    } else {
      // Agregar los que faltan
      for (const c of claves) {
        if (!this.form.permisos.includes(c)) {
          this.form.permisos.push(c);
        }
      }
    }
  }

  grupoCompleto(grupo: any): boolean {
    return grupo.permisos.every((p: any) => this.form.permisos.includes(p.clave));
  }

  grupoParcial(grupo: any): boolean {
    const tiene = grupo.permisos.some((p: any) => this.form.permisos.includes(p.clave));
    return tiene && !this.grupoCompleto(grupo);
  }

  seleccionarTodos() {
    this.form.permisos = [];
    for (const g of this.gruposPermisos) {
      for (const p of g.permisos) {
        this.form.permisos.push(p.clave);
      }
    }
  }

  deseleccionarTodos() {
    this.form.permisos = [];
  }

  guardar() {
    if (!this.form.nombre.trim()) {
      this.alert.error('Error', 'El nombre del rol es requerido.');
      return;
    }

    this.saving = true;

    const data: any = {
      nombre: this.form.nombre.trim(),
      descripcion: this.form.descripcion.trim(),
      permisos: this.form.permisos,
    };

    if (this.modo === 'crear') {
      if (this.form.slug.trim()) {
        data.slug = this.form.slug.trim();
      }

      this.svc.crear(data).subscribe({
        next: () => {
          this.saving = false;
          this.alert.success('Rol creado exitosamente');
          this.router.navigate(['/roles']);
        },
        error: (err: any) => {
          this.saving = false;
          this.alert.error('Error', err?.error?.message ?? 'No se pudo crear el rol.');
        },
      });
    } else {
      this.svc.actualizar(this.rolId, data).subscribe({
        next: () => {
          this.saving = false;
          this.alert.success('Rol actualizado exitosamente');
          this.router.navigate(['/roles']);
        },
        error: (err: any) => {
          this.saving = false;
          this.alert.error('Error', err?.error?.message ?? 'No se pudo actualizar el rol.');
        },
      });
    }
  }

  volver() {
    this.router.navigate(['/roles']);
  }
}
