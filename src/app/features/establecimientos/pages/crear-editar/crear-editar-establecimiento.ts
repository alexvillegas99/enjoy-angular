import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { EstablecimientosService } from '../../../../services/establecimientos.service';
import { LucideAngularModule } from 'lucide-angular';
import { SelectorCategorias } from '../../components/selector-categorias/selector-categorias';
import { SelectorCiudades } from '../../components/selector-ciudades/selector-ciudades';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  standalone: true,
  selector: 'app-crear-editar-establecimiento',
  imports: [
    FormsModule,
    LucideAngularModule,
    SelectorCategorias,
    SelectorCiudades,
    DatePipe,
  ],
  templateUrl: './crear-editar-establecimiento.html',
})
export class CrearEditarEstablecimiento {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(EstablecimientosService);
  private alert = inject(AlertService);

  isEdit = false;
  loading = false;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.isEdit = !!id;

      if (id) {
        this.loading = true;
        this.svc.obtener(id).subscribe((e) => {
          const categoriasIds = Array.isArray(e.categorias)
            ? e.categorias.map((c: any) => (typeof c === 'object' ? c._id : c))
            : [];

          const ciudadesIds = Array.isArray(e.ciudades)
            ? e.ciudades.map((c: any) => (typeof c === 'object' ? c._id : c))
            : [];

          this.model = {
            ...this.model,
            ...e,
            categorias: categoriasIds,
            ciudades: ciudadesIds,
            detallePromocion: {
              ...this.model.detallePromocion,
              ...e.detallePromocion,
            },
            detallePromocionesExtra: e.detallePromocionesExtra || [],
          };

          this.convertirFechas();
          this.loading = false;
        });
      }
    });
  }

  convertirFechas() {
    // Convertir fechas de string a Date
    if (
      this.model.detallePromocion.startDate &&
      typeof this.model.detallePromocion.startDate === 'string'
    ) {
      this.model.detallePromocion.startDate = new Date(
        this.model.detallePromocion.startDate,
      );
    }
    if (
      this.model.detallePromocion.endDate &&
      typeof this.model.detallePromocion.endDate === 'string'
    ) {
      this.model.detallePromocion.endDate = new Date(
        this.model.detallePromocion.endDate,
      );
    }

    // Convertir fechas excluidas
    if (this.model.detallePromocion.fechasExcluidas) {
      this.model.detallePromocion.fechasExcluidas =
        this.model.detallePromocion.fechasExcluidas.map((fecha: any) =>
          typeof fecha === 'string' ? new Date(fecha) : fecha,
        );
    }
  }

  addTag(tagInput: HTMLInputElement) {
    const tag = tagInput.value.trim();
    if (tag && !this.model.detallePromocion.tags.includes(tag)) {
      this.model.detallePromocion.tags.push(tag);
      tagInput.value = '';
    }
  }

  removeTag(i: number) {
    this.model.detallePromocion.tags.splice(i, 1);
  }

  addFechaExcluida(input: HTMLInputElement) {
    const fecha = new Date(input.value);
    if (!isNaN(fecha.getTime())) {
      if (
        !this.model.detallePromocion.fechasExcluidas.some(
          (f: Date) => f.toDateString() === fecha.toDateString(),
        )
      ) {
        this.model.detallePromocion.fechasExcluidas.push(fecha);
      }
      input.value = '';
    }
  }

  removeFechaExcluida(i: number) {
    this.model.detallePromocion.fechasExcluidas.splice(i, 1);
  }

  onDateChange(event: Event, field: 'startDate' | 'endDate') {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.model.detallePromocion[field] = new Date(input.value);
    } else {
      this.model.detallePromocion[field] = null;
    }
  }

  addPromocionExtra() {
    this.model.detallePromocionesExtra.push({
      title: '',
      placeName: this.model.nombre,
      aplicaTodosLosDias: true,
      scheduleLabel: '',
      isTwoForOne: false,
      tags: [],
    });
  }

  removePromocionExtra(i: number) {
    this.model.detallePromocionesExtra.splice(i, 1);
  }

submit() {

  if (!this.validate()) {
    this.alert.warning('Formulario incompleto', 'Revisa los campos obligatorios.');
    return;
  }

  const payload = structuredClone(this.model);

  payload.detallePromocion.placeName = payload.nombre;

  if (payload.detallePromocionesExtra?.length) {
    payload.detallePromocionesExtra.forEach((promo: any) => {
      promo.placeName = promo.placeName || payload.nombre;
    });
  }

  const isObjectId = (v: any) =>
    typeof v === 'string' && /^[a-f\d]{24}$/i.test(v);

  if (Array.isArray(payload.categorias)) {
    payload.categorias = payload.categorias.filter(isObjectId);
    if (!payload.categorias.length) delete payload.categorias;
  } else {
    delete payload.categorias;
  }

  if (Array.isArray(payload.ciudades)) {
    payload.ciudades = payload.ciudades.filter(isObjectId);
    if (!payload.ciudades.length) delete payload.ciudades;
  } else {
    delete payload.ciudades;
  }

  this.limpiarPayload(payload);

  this.loading = true;

  const req = this.isEdit
    ? this.svc.update(payload._id, payload)
    : this.svc.create(payload);

  req.subscribe({
    next: async () => {
      this.loading = false;

      await this.alert.success(
        this.isEdit ? 'Establecimiento actualizado' : 'Establecimiento creado',
        'La información se guardó correctamente.'
      );

      this.router.navigate(['/establecimientos']);
    },
    error: (err) => {
      this.loading = false;

      console.error(err);

      this.alert.error(
        'Error al guardar',
        err?.error?.message || 'Ocurrió un error inesperado.'
      );
    }
  });
}
limpiarPayload(payload: any) {

  const d = payload.detallePromocion;

  // 🔥 Ya no se usan en interfaz
  delete d.rating;
  delete d.distanceLabel;

  // Imágenes base64 (solo si existen)
  if (!d.imageBase64) delete d.imageBase64;
  if (!d.logoBase64) delete d.logoBase64;

  // El backend genera estas URLs
  delete d.imageUrl;
  delete d.logoUrl;

  // Campos opcionales vacíos
  if (!d.tags?.length) delete d.tags;
  if (!d.fechasExcluidas?.length) delete d.fechasExcluidas;
  if (!d.startDate) delete d.startDate;
  if (!d.endDate) delete d.endDate;

  // Horarios si aplica todos los días
  if (d.aplicaTodosLosDias) {
    delete d.diasAplicables;
    delete d.horarioPorDia;
  }

  // Promociones extra
  if (!payload.detallePromocionesExtra?.length) {
    delete payload.detallePromocionesExtra;
  }
}

  onFile(event: Event, field: 'imageBase64' | 'logoBase64') {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    // validar tipo
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      input.value = '';
      return;
    }

    // validar tamaño (opcional, 5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.model.detallePromocion[field] = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  toggleAplicaTodosLosDias() {
    if (this.model.detallePromocion.aplicaTodosLosDias) {
      // Limpiar días específicos si aplica a todos
      this.model.detallePromocion.diasAplicables = [];
      this.model.detallePromocion.horarioPorDia = {};
    }
  }

  toggleDia(dia: string) {
    const idx = this.model.detallePromocion.diasAplicables.indexOf(dia);

    if (idx >= 0) {
      this.model.detallePromocion.diasAplicables.splice(idx, 1);
      delete this.model.detallePromocion.horarioPorDia[dia];
    } else {
      this.model.detallePromocion.diasAplicables.push(dia);
      this.model.detallePromocion.horarioPorDia[dia] = {
        abre: '09:00',
        cierra: '18:00',
      };
    }
  }

  errors: any = {};

  dias = [
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado',
    'domingo',
  ];

  model: any = {
    nombre: '',
    email: '',
    telefono: '',
    identificacion: '',
    rol: 'admin-local',
    estado: true,
    usuarioCreacion: null,

    ciudades: [] as string[],
    categorias: [] as string[], // aquí van los _id

    promocion: '',
    horarioAtencion: '',

    detallePromocion: {
      id: undefined,
      title: '',
      placeName: '',
      description: '',
      address: '',

      isTwoForOne: false,
      isFlash: false,
      aplicaTodosLosDias: true,

      diasAplicables: [] as string[],
      horarioPorDia: {} as Record<string, { abre: string; cierra: string }>,

      scheduleLabel: '',
      distanceLabel: '',

      startDate: null as Date | null,
      endDate: null as Date | null,

      rating: 0,
      tags: [] as string[],

      fechasExcluidas: [] as Date[],

      imageBase64: null,
      logoBase64: null,
      imageUrl: null,
      logoUrl: null,
    },

    detallePromocionesExtra: [] as any[],
  };

  validate(): boolean {
    this.errors = {};

    if (!this.model.nombre?.trim()) this.errors.nombre = 'Requerido';
    if (!this.model.email?.trim()) this.errors.email = 'Requerido';
    if (!this.model.identificacion?.trim())
      this.errors.identificacion = 'Requerido';
    if (!this.model.ciudades?.length)
      this.errors.ciudades = 'Selecciona al menos una ciudad';
    if (!this.model.categorias?.length)
      this.errors.categorias = 'Selecciona al menos una categoría';
    if (!this.model.detallePromocion.title?.trim())
      this.errors.title = 'Título de promoción requerido';

    return Object.keys(this.errors).length === 0;
  }
}
