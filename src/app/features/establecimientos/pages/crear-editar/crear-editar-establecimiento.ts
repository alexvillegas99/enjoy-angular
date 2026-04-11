import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { EstablecimientosService } from '../../../../services/establecimientos.service';
import { LucideAngularModule } from 'lucide-angular';
import { SelectorCategorias } from '../../components/selector-categorias/selector-categorias';
import { SelectorCiudades } from '../../components/selector-ciudades/selector-ciudades';
import { AlertService } from '../../../../core/services/alert.service';
import { PermissionsService } from '../../../../core/services/permissions.service';

@Component({
  standalone: true,
  selector: 'app-crear-editar-establecimiento',
  imports: [
    FormsModule,
    LucideAngularModule,
    SelectorCategorias,
    SelectorCiudades,
    DatePipe,
    RouterLink,
  ],
  templateUrl: './crear-editar-establecimiento.html',
})
export class CrearEditarEstablecimiento {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(EstablecimientosService);
  private alert = inject(AlertService);
  private perms = inject(PermissionsService);

  isEdit = false;
  loading = false;
  geoLoading = false;
  geoError = '';
  geocodeLoading = false;

  /** Solo puede editar fotos (mkt-fotos) */
  get soloFotos(): boolean {
    return this.perms.hasPermission('establecimientos.fotos') &&
      !this.perms.hasPermission('establecimientos.editar') &&
      !this.perms.hasPermission('usuarios.editar');
  }

  /** Solo puede editar detalles sin fotos (vendedor) */
  get soloDetalles(): boolean {
    return this.perms.hasPermission('establecimientos.editar') &&
      !this.perms.hasPermission('establecimientos.fotos') &&
      !this.perms.hasPermission('usuarios.editar');
  }

  dias = [
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado',
    'domingo',
  ];

  errors: Record<string, string> = {};

  model: any = {
    nombre: '',
    email: '',
    telefono: '',
    identificacion: '',
    rol: 'admin-local',
    estado: true,
    usuarioCreacion: null,
    ubicacion: null as { lat: number; lng: number } | null,
    ciudades: [] as string[],
    categorias: [] as string[],
    detallePromocion: {
      id: undefined,
      title: '',
      placeName: '',
      description: '',
      address: '',
      isTwoForOne: false,
      aplicaTodosLosDias: true,
      diasAplicables: [] as string[],
      horarioPorDia: {} as Record<string, { abre: string; cierra: string }>,
      scheduleLabel: '',
      tags: [] as string[],
      fechasExcluidas: [] as Date[],
      imageBase64: null,
      logoBase64: null,
      imageUrl: null,
      logoUrl: null,
    },
    detallePromocionesExtra: [] as any[],
  };

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.isEdit = !!id;

      if (id) {
        this.loading = true;
        this.svc.obtener(id).subscribe({
          next: (e) => {
            const categoriasIds = Array.isArray(e.categorias)
              ? e.categorias.map((c: any) => (typeof c === 'object' ? c._id : c))
              : [];

            const ciudadesIds = Array.isArray(e.ciudades)
              ? e.ciudades.map((c: any) => (typeof c === 'object' ? c._id : c))
              : [];

            this.model = {
              ...this.model,
              ...e,
              telefono: this.desformatearTelefono(e.telefono),
              categorias: categoriasIds,
              ciudades: ciudadesIds,
              detallePromocion: {
                ...this.model.detallePromocion,
                ...e.detallePromocion,
              },
              detallePromocionesExtra: (Array.isArray(e.detallePromocionesExtra) ? e.detallePromocionesExtra : []).map((p: any) => ({
                ...p,
                startDate: p.startDate ? new Date(p.startDate) : null,
                endDate: p.endDate ? new Date(p.endDate) : null,
              })),
            };

            this.convertirFechas();
            this.loading = false;
          },
          error: (err) => {
            this.loading = false;
            this.alert.error(
              'Error al cargar',
              this.extraerMensajeError(err)
            );
          },
        });
      }
    });
  }

  convertirFechas() {
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

  addPromocionExtra() {
    this.model.detallePromocionesExtra.push({
      title: '',
      placeName: this.model.nombre,
      aplicaTodosLosDias: true,
      scheduleLabel: '',
      isTwoForOne: false,
      isFlash: false,
      tags: [],
      startDate: null as Date | null,
      endDate: null as Date | null,
    });
  }

  removePromocionExtra(i: number) {
    this.model.detallePromocionesExtra.splice(i, 1);
  }

  onExtraDateChange(event: Event, index: number, field: 'startDate' | 'endDate') {
    const input = event.target as HTMLInputElement;
    this.model.detallePromocionesExtra[index][field] = input.value
      ? new Date(input.value)
      : null;
  }

  submit() {
    if (!this.validate()) return;

    const payload = structuredClone(this.model);

    // Formatear teléfono con código de país
    if (payload.telefono?.trim()) {
      payload.telefono = this.formatearTelefono(payload.telefono.trim());
    }

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
          'La información se guardó correctamente.',
        );
        this.router.navigate(['/establecimientos']);
      },
      error: (err) => {
        this.loading = false;
        this.alert.error('Error al guardar', this.extraerMensajeError(err));
      },
    });
  }

  limpiarPayload(payload: any) {
    const d = payload.detallePromocion;

    // Campos que no pertenecen a detallePromocion principal
    delete d.rating;
    delete d.distanceLabel;
    delete d.startDate;
    delete d.endDate;
    delete d.isFlash;

    if (!d.imageBase64) delete d.imageBase64;
    if (!d.logoBase64) delete d.logoBase64;
    delete d.imageUrl;
    delete d.logoUrl;

    if (!d.tags?.length) delete d.tags;
    if (!d.fechasExcluidas?.length) delete d.fechasExcluidas;

    if (d.aplicaTodosLosDias) {
      delete d.diasAplicables;
      delete d.horarioPorDia;
    }

    // Limpiar promos extra
    if (payload.detallePromocionesExtra?.length) {
      payload.detallePromocionesExtra = payload.detallePromocionesExtra.map((p: any) => {
        const clean: any = { ...p };
        if (!clean.startDate) delete clean.startDate;
        if (!clean.endDate) delete clean.endDate;
        if (!clean.tags?.length) delete clean.tags;
        if (!clean.diasAplicables?.length) delete clean.diasAplicables;
        if (clean.aplicaTodosLosDias) {
          delete clean.diasAplicables;
          delete clean.horarioPorDia;
        }
        return clean;
      });
    } else {
      delete payload.detallePromocionesExtra;
    }
  }

  onFile(event: Event, field: 'imageBase64' | 'logoBase64') {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.alert.warning('Archivo inválido', 'Solo se permiten imágenes.');
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.alert.warning('Archivo muy grande', 'La imagen no debe superar los 5 MB.');
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

  validate(): boolean {
    this.errors = {};

    // Nombre
    if (!this.model.nombre?.trim()) {
      this.errors['nombre'] = 'El nombre es obligatorio';
    }

    // Email
    const email = this.model.email?.trim();
    if (!email) {
      this.errors['email'] = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.errors['email'] = 'Ingresa un email válido';
    }

    // Teléfono
    const tel = this.model.telefono?.trim();
    if (tel && !/^[0-9]{7,10}$/.test(tel.replace(/^0/, ''))) {
      this.errors['telefono'] = 'Ingresa un número válido (7-10 dígitos)';
    }

    // Identificación (CI: 10 dígitos, RUC: 13 dígitos)
    const id = this.model.identificacion?.trim();
    if (!id) {
      this.errors['identificacion'] = 'La identificación es obligatoria';
    } else if (!/^\d{10}(\d{3})?$/.test(id)) {
      this.errors['identificacion'] = 'CI (10 dígitos) o RUC (13 dígitos)';
    }

    // Selecciones
    if (!this.model.ciudades?.length)
      this.errors['ciudades'] = 'Selecciona al menos una ciudad';
    if (!this.model.categorias?.length)
      this.errors['categorias'] = 'Selecciona al menos una categoría';

    // Promoción principal
    if (!this.model.detallePromocion.title?.trim())
      this.errors['title'] = 'El título de la promoción es obligatorio';
    if (!this.model.detallePromocion.scheduleLabel?.trim())
      this.errors['scheduleLabel'] = 'El horario es obligatorio (ej: Lun-Dom 10:00–19:00)';

    // Días específicos sin horario seleccionado
    if (
      !this.model.detallePromocion.aplicaTodosLosDias &&
      !this.model.detallePromocion.diasAplicables?.length
    ) {
      this.errors['dias'] = 'Selecciona al menos un día o marca "Aplica todos los días"';
    }

    if (Object.keys(this.errors).length > 0) {
      const mensajes = Object.values(this.errors).join('\n');
      this.alert.warning('Formulario incompleto', mensajes);
      return false;
    }

    return true;
  }

  obtenerUbicacion() {
    if (!navigator.geolocation) {
      this.geoError = 'Tu navegador no soporta geolocalización.';
      return;
    }
    this.geoLoading = true;
    this.geoError = '';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = +pos.coords.latitude.toFixed(7);
        const lng = +pos.coords.longitude.toFixed(7);
        this.model.ubicacion = { lat, lng };
        this.geoLoading = false;
        this.reverseGeocode(lat, lng);
      },
      (err) => {
        this.geoLoading = false;
        this.geoError =
          err.code === 1
            ? 'Permiso denegado. Activa la ubicación en el navegador.'
            : 'No se pudo obtener la ubicación. Intenta de nuevo.';
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  private reverseGeocodeTimer: any = null;

  private async reverseGeocode(lat: number, lng: number) {
    this.geocodeLoading = true;
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`,
        { headers: { 'Accept-Language': 'es' } },
      );
      const data = await resp.json();
      const a = data?.address ?? {};

      const partes = [
        a.road ?? a.pedestrian ?? a.footway ?? '',
        a.house_number ?? '',
        a.suburb ?? a.neighbourhood ?? a.quarter ?? '',
        a.city ?? a.town ?? a.village ?? a.county ?? '',
      ].filter(Boolean);

      if (partes.length) {
        this.model.detallePromocion.address = partes.join(', ');
      }
    } catch (_) {
      // Si falla no pasa nada, el usuario puede escribir la dirección manual
    } finally {
      this.geocodeLoading = false;
    }
  }

  limpiarUbicacion() {
    this.model.ubicacion = null;
    this.geoError = '';
  }

  onLatManual(event: Event) {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(val)) {
      this.model.ubicacion = { lat: val, lng: this.model.ubicacion?.lng ?? 0 };
      this.scheduleReverseGeocode();
    }
  }

  onLngManual(event: Event) {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(val)) {
      this.model.ubicacion = { lat: this.model.ubicacion?.lat ?? 0, lng: val };
      this.scheduleReverseGeocode();
    }
  }

  private scheduleReverseGeocode() {
    clearTimeout(this.reverseGeocodeTimer);
    this.reverseGeocodeTimer = setTimeout(() => {
      const { lat, lng } = this.model.ubicacion ?? {};
      if (lat && lng) this.reverseGeocode(lat, lng);
    }, 800);
  }

  private formatearTelefono(tel: string): string {
    if (!tel) return tel;
    let limpio = tel.replace(/\D/g, '');
    if (limpio.startsWith('593')) return `+${limpio}`;
    if (limpio.startsWith('0')) limpio = limpio.substring(1);
    return `+593${limpio}`;
  }

  private desformatearTelefono(tel: string): string {
    if (!tel) return tel;
    // Quitar +593 o 593 del inicio y devolver con 0
    let limpio = tel.replace(/\D/g, '');
    if (limpio.startsWith('593')) limpio = limpio.substring(3);
    if (!limpio.startsWith('0')) limpio = '0' + limpio;
    return limpio;
  }

  private extraerMensajeError(err: any): string {
    const body = err?.error;
    const msg = body?.message;

    // Backend responde { message: { message: "...", error: "...", statusCode: ... } }
    if (msg && typeof msg === 'object' && !Array.isArray(msg)) {
      if (typeof msg.message === 'string') return msg.message;
      if (Array.isArray(msg.message)) return msg.message.join(', ');
    }

    // Backend responde { message: ["error1", "error2"] }
    if (Array.isArray(msg)) return msg.join(', ');

    // Backend responde { message: "texto" }
    if (typeof msg === 'string') return msg;

    if (body?.error && typeof body.error === 'string') return body.error;
    if (err?.status === 0) return 'No se pudo conectar con el servidor.';
    if (err?.status === 409) return 'Ya existe un registro con estos datos.';
    if (err?.status === 404) return 'No se encontró el recurso solicitado.';
    if (err?.status === 403) return 'No tienes permisos para esta acción.';
    return 'Ocurrió un error inesperado. Intenta de nuevo.';
  }
}
