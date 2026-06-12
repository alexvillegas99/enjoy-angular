import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CampanasService } from '../../../../services/campanas.service';
import { ProvinciasService } from '../../../../services/provincia.service';
import { CiudadesService } from '../../../../services/ciudad.service';
import { CategoriasService } from '../../../../services/categorias.service';
import { AlertService } from '../../../../core/services/alert.service';

interface ListItem { _id: string; nombre: string; }

@Component({
  selector: 'app-form-campana',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './form-campana.html',
})
export class FormCampana implements OnInit {
  private svc = inject(CampanasService);
  private provSvc = inject(ProvinciasService);
  private ciuSvc = inject(CiudadesService);
  private catSvc = inject(CategoriasService);
  private alert = inject(AlertService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id: string | null = null;
  loading = false;
  saving = false;

  m: any = {
    titulo: '',
    cuerpo: '',
    imagenUrl: '',
    tipoSegmento: 'TODOS',
    provinciaId: '',
    ciudadId: '',
    categoriaId: '',
    topicCustom: '',
    tipoAccion: 'NINGUNA',
    accionRefId: '',
    accionUrl: '',
    programadaPara: '',
    guardarBorrador: false,
    enviarPush: true,
    estado: 'BORRADOR',
    totalDestinatarios: 0,
  };

  provincias: ListItem[] = [];
  ciudades: ListItem[] = [];
  categorias: ListItem[] = [];

  esEdicionEnviada = false;

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.cargarCatalogos();
    if (this.id) this.cargar();
  }

  cargarCatalogos() {
    this.provSvc.getActivas().subscribe({
      next: (r: any) => (this.provincias = r as any),
      error: () => {},
    });
    this.catSvc.getActivas().subscribe({
      next: (r: any) => (this.categorias = r as any),
      error: () => {},
    });
  }

  onProvinciaChange() {
    this.m.ciudadId = '';
    if (!this.m.provinciaId) {
      this.ciudades = [];
      return;
    }
    this.ciuSvc
      .listar({ provincia: this.m.provinciaId, limit: 200, page: 1 })
      .subscribe({
        next: (r: any) => (this.ciudades = (r?.items ?? r ?? []) as any),
        error: () => (this.ciudades = []),
      });
  }

  cargar() {
    if (!this.id) return;
    this.loading = true;
    this.svc.obtener(this.id).subscribe({
      next: (r) => {
        this.m = {
          ...this.m,
          ...r,
          provinciaId:
            (typeof r.provinciaId === 'object' && r.provinciaId)
              ? r.provinciaId._id
              : r.provinciaId || '',
          ciudadId:
            (typeof r.ciudadId === 'object' && r.ciudadId)
              ? r.ciudadId._id
              : r.ciudadId || '',
          categoriaId:
            (typeof r.categoriaId === 'object' && r.categoriaId)
              ? r.categoriaId._id
              : r.categoriaId || '',
          programadaPara: r.programadaPara
            ? new Date(r.programadaPara).toISOString().slice(0, 16)
            : '',
        };
        this.esEdicionEnviada = r.estado === 'ENVIADA';
        if (this.m.provinciaId) this.onProvinciaChange();
        this.loading = false;
      },
      error: () => {
        this.alert.error('Error', 'No se pudo cargar la campaña.');
        this.loading = false;
      },
    });
  }

  guardar(modo: 'borrador' | 'programar' | 'enviar_ahora') {
    if (!this.m.titulo || !this.m.cuerpo) {
      this.alert.error('Faltan datos', 'Título y mensaje son obligatorios.');
      return;
    }
    if (this.m.tipoSegmento === 'PROVINCIA' && !this.m.provinciaId) {
      this.alert.error('Faltan datos', 'Selecciona la provincia.');
      return;
    }
    if (this.m.tipoSegmento === 'CIUDAD' && !this.m.ciudadId) {
      this.alert.error('Faltan datos', 'Selecciona la ciudad.');
      return;
    }
    if (this.m.tipoSegmento === 'CATEGORIA' && !this.m.categoriaId) {
      this.alert.error('Faltan datos', 'Selecciona la categoría.');
      return;
    }
    if (this.m.tipoSegmento === 'TOPIC' && !this.m.topicCustom) {
      this.alert.error('Faltan datos', 'Indica el topic.');
      return;
    }
    if (modo === 'programar' && !this.m.programadaPara) {
      this.alert.error('Faltan datos', 'Selecciona fecha de programación.');
      return;
    }

    const body: any = {
      titulo: this.m.titulo,
      cuerpo: this.m.cuerpo,
      imagenUrl: this.m.imagenUrl || undefined,
      tipoSegmento: this.m.tipoSegmento,
      provinciaId: this.m.provinciaId || undefined,
      ciudadId: this.m.ciudadId || undefined,
      categoriaId: this.m.categoriaId || undefined,
      topicCustom: this.m.topicCustom || undefined,
      tipoAccion: this.m.tipoAccion || 'NINGUNA',
      accionRefId: this.m.accionRefId || undefined,
      accionUrl: this.m.accionUrl || undefined,
      programadaPara:
        modo === 'programar' && this.m.programadaPara
          ? new Date(this.m.programadaPara).toISOString()
          : undefined,
      guardarBorrador: modo === 'borrador',
      enviarPush: modo !== 'borrador',
    };

    this.saving = true;
    const obs = this.id
      ? this.svc.actualizar(this.id, body)
      : this.svc.crear(body);

    obs.subscribe({
      next: (r) => {
        this.saving = false;
        if (modo === 'borrador') {
          this.alert.success('Guardada', 'Campaña guardada como borrador.');
        } else if (modo === 'programar') {
          this.alert.success(
            'Programada',
            'Se enviará en la fecha indicada.',
          );
        } else {
          this.alert.success(
            'Enviada',
            'Campaña enviada (push + bandeja in-app).',
          );
        }
        // Si es nueva y modo "enviar_ahora", el back ya disparó el envío
        // dentro de `crear`. Si es edición, llamamos a enviar.
        if (modo === 'enviar_ahora' && this.id) {
          this.svc.enviar(this.id).subscribe({ next: () => {}, error: () => {} });
        }
        this.router.navigate(['/notificaciones']);
      },
      error: (e) => {
        this.saving = false;
        this.alert.error(
          'Error',
          e?.error?.message || 'No se pudo guardar la campaña.',
        );
      },
    });
  }

  cancelar() {
    this.router.navigate(['/notificaciones']);
  }
}
