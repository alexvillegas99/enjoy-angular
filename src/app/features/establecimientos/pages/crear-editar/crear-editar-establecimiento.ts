import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import * as L from 'leaflet';
import { EstablecimientosService } from '../../../../services/establecimientos.service';
import { LucideAngularModule } from 'lucide-angular';
import { SelectorCategorias } from '../../components/selector-categorias/selector-categorias';
import { SelectorCiudades } from '../../components/selector-ciudades/selector-ciudades';
import { SelectorProvincias } from '../../components/selector-provincias/selector-provincias';
import { HorarioBuilder } from '../../components/horario-builder/horario-builder';
import { CiudadesService } from '../../../../services/ciudad.service';
import { AlertService } from '../../../../core/services/alert.service';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { ImageCropperModal } from '../../../../shared/components/image-cropper-modal/image-cropper-modal';

@Component({
  standalone: true,
  selector: 'app-crear-editar-establecimiento',
  imports: [
    FormsModule,
    LucideAngularModule,
    SelectorCategorias,
    SelectorCiudades,
    SelectorProvincias,
    HorarioBuilder,
    DatePipe,
    RouterLink,
    ImageCropperModal,
  ],
  templateUrl: './crear-editar-establecimiento.html',
  styleUrl: './crear-editar-establecimiento.scss',
})
export class CrearEditarEstablecimiento {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(EstablecimientosService);
  private alert = inject(AlertService);
  private perms = inject(PermissionsService);
  private ciudadesSvc = inject(CiudadesService);

  /** Provincia seleccionada (obligatoria) — filtra las ciudades. No se envía al backend. */
  provinciaSel: string | null = null;

  isEdit = false;
  loading = false;
  geoLoading = false;
  geoError = '';
  geocodeLoading = false;

  /** Estado del modal de mapa (Leaflet) */
  mapaAbierto = false;
  mapSeleccion: { lat: number; lng: number } | null = null;
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

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

  // ───────────────────────── Wizard por pasos ─────────────────────────
  /** Definición de pasos. `group` controla visibilidad por rol. */
  readonly PASOS_DEF: Array<{ id: string; label: string; icon: string; group: 'detalles' | 'fotos' | 'always' }> = [
    { id: 'datos', label: 'Datos básicos', icon: 'store', group: 'detalles' },
    { id: 'ubicacion', label: 'Ubicación y categorías', icon: 'map-pin', group: 'detalles' },
    { id: 'promocion', label: 'Promoción y horarios', icon: 'ticket', group: 'detalles' },
    { id: 'imagenes', label: 'Imágenes', icon: 'image', group: 'fotos' },
    { id: 'catalogo', label: 'Catálogo', icon: 'shopping-bag', group: 'fotos' },
    { id: 'resumen', label: 'Resumen', icon: 'check-circle', group: 'always' },
  ];

  currentStep = 0;

  /** Pasos visibles según el rol del usuario. */
  get pasos() {
    return this.PASOS_DEF.filter((p) => {
      if (p.group === 'always') return true;
      if (this.soloFotos) return p.group === 'fotos';
      if (this.soloDetalles) return p.group === 'detalles';
      return true;
    });
  }

  get pasoActual(): string {
    return this.pasos[this.currentStep]?.id ?? '';
  }

  get progresoPorcentaje(): number {
    return this.pasos.length
      ? Math.round(((this.currentStep + 1) / this.pasos.length) * 100)
      : 0;
  }

  get pasoDescripcion(): string {
    const descripciones: Record<string, string> = {
      datos: 'Información principal, contacto y disponibilidad del establecimiento.',
      ubicacion: 'Clasificación, cobertura por ciudad y coordenadas del local.',
      promocion: 'Beneficio principal, horarios, restricciones y promociones adicionales.',
      imagenes: 'Logo, portada y material visual que verán los clientes.',
      catalogo: 'Productos o servicios destacados dentro del perfil del local.',
      resumen: 'Comprueba la información antes de guardar los cambios.',
    };

    return descripciones[this.pasoActual] ?? '';
  }

  esPaso(id: string): boolean {
    return this.pasoActual === id;
  }

  get esUltimoPaso(): boolean {
    return this.currentStep >= this.pasos.length - 1;
  }

  /** Avanza al siguiente paso validando solo el actual. */
  nextStep() {
    if (!this.validateStep(this.pasoActual)) return;
    if (!this.esUltimoPaso) {
      this.currentStep++;
      this.scrollTop();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.scrollTop();
    }
  }

  /** Salta a un paso. Hacia atrás o en edición es libre; hacia adelante valida el actual. */
  goStep(i: number) {
    if (i < 0 || i >= this.pasos.length) return;
    if (i <= this.currentStep || this.isEdit) {
      this.currentStep = i;
      this.scrollTop();
    } else if (this.validateStep(this.pasoActual)) {
      this.currentStep = i;
      this.scrollTop();
    }
  }

  private scrollTop() {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Guarda SOLO la sección/paso actual (PATCH parcial). Solo en edición.
   * No exige campos de otras secciones — guarda lo que haya en este paso.
   */
  guardarSeccion() {
    if (!this.isEdit || !this.model._id) return;

    const isObjectId = (v: any) => typeof v === 'string' && /^[a-f\d]{24}$/i.test(v);
    const d = this.model.detallePromocion;
    const payload: any = { _id: this.model._id };

    switch (this.pasoActual) {
      case 'datos':
        payload.nombre = this.model.nombre;
        payload.email = this.model.email;
        payload.identificacion = this.model.identificacion;
        payload.estado = this.model.estado;
        if (this.model.telefono?.trim())
          payload.telefono = this.formatearTelefono(this.model.telefono.trim());
        break;
      case 'ubicacion':
        payload.categorias = (this.model.categorias ?? []).filter(isObjectId);
        payload.ciudades = (this.model.ciudades ?? []).filter(isObjectId);
        if (this.model.ubicacion) payload.ubicacion = this.model.ubicacion;
        break;
      case 'promocion': {
        const dp: any = {
          title: d.title,
          placeName: this.model.nombre,
          description: d.description,
          address: d.address,
          scheduleLabel: d.scheduleLabel,
          isTwoForOne: true, // siempre 2x1 (no editable)
          aplicaTodosLosDias: d.aplicaTodosLosDias,
        };
        if (d.tags?.length) dp.tags = d.tags;
        if (d.fechasExcluidas?.length) dp.fechasExcluidas = d.fechasExcluidas;
        if (!d.aplicaTodosLosDias) {
          dp.diasAplicables = d.diasAplicables;
          dp.horarioPorDia = d.horarioPorDia;
        }
        payload.detallePromocion = dp;
        break;
      }
      case 'imagenes': {
        const dp: any = {};
        if (d.logoBase64) dp.logoBase64 = d.logoBase64;
        else if (d.logoUrl) dp.logoUrl = d.logoUrl;
        if (Array.isArray(d.galeria)) {
          dp.galeria = d.galeria
            .map((item: any) => {
              const type = item?.type === 'video' ? 'video' : 'image';
              if (item?.base64) return { base64: item.base64, type };
              if (item?.url) return { url: item.url, type };
              return null;
            })
            .filter(Boolean)
            .slice(0, this.MAX_GALERIA);
        }
        payload.detallePromocion = dp;
        break;
      }
      case 'catalogo': {
        const dp: any = {};
        if (Array.isArray(d.productos)) {
          dp.productos = d.productos
            .map((p: any) => {
              if (!p?.base64 && !p?.url) return null;
              const out: any = {
                nombre: (p?.nombre ?? '').trim(),
                descripcion: (p?.descripcion ?? '').trim(),
              };
              if (p.base64) out.base64 = p.base64;
              else out.url = p.url;
              return out;
            })
            .filter(Boolean);
        }
        payload.detallePromocion = dp;
        break;
      }
      default:
        return; // resumen u otros: no aplica
    }

    this.loading = true;
    this.svc.update(this.model._id, payload).subscribe({
      next: async () => {
        this.loading = false;
        await this.alert.success(
          'Sección guardada',
          'Los cambios de esta sección se guardaron.',
        );
      },
      error: (err) => {
        this.loading = false;
        this.alert.error('Error al guardar', this.extraerMensajeError(err));
      },
    });
  }

  model: any = {
    nombre: '',
    email: '',
    telefono: '',
    identificacion: '',
    rol: 'admin-local',
    estado: false,
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
      isTwoForOne: true,
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
      galeria: [] as Array<{ url?: string; type: 'image' | 'video'; base64?: string }>,
      productos: [] as Array<{
        nombre: string;
        descripcion: string;
        url?: string;
        base64?: string;
      }>,
    },
    detallePromocionesExtra: [] as any[],
  };

  /** Máximo de elementos en la galería del local */
  readonly MAX_GALERIA = 5;
  /** Tamaño máximo permitido para videos de galería (MB) */
  readonly MAX_VIDEO_MB = 25;

  /** Estado del modal de recorte */
  cropperVisible = false;
  cropperFile: File | null = null;
  cropperTitle = 'Recortar imagen';
  /** Destino del recorte: logo, imagen principal, item de galería o producto */
  private cropperTarget:
    | 'imageBase64'
    | 'logoBase64'
    | 'galeria'
    | 'producto' = 'imageBase64';
  /** Índice de galería a reemplazar (null = agregar nuevo) */
  private cropperGaleriaIndex: number | null = null;
  /** Índice del producto cuya foto se está recortando */
  private cropperProductoIndex: number | null = null;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.isEdit = !!id;

      if (id) {
        this.loading = true;
        this.svc.obtener(id).subscribe({
          next: (e) => {
            // Preferir los arrays *Ids (nuevos, con _id reales). Si vienen,
            // los strings de e.ciudades/e.categorias son sólo nombres
            // legibles (mapNombres del back los aplana). Fallback al
            // formato viejo si el back no enviara los *Ids todavía.
            const categoriasIds: string[] = Array.isArray(e.categoriasIds)
              ? e.categoriasIds
              : Array.isArray(e.categorias)
                ? e.categorias
                    .map((c: any) => (typeof c === 'object' ? c._id : c))
                    .filter((x: any) => /^[a-f\d]{24}$/i.test(x))
                : [];

            const ciudadesIds: string[] = Array.isArray(e.ciudadesIds)
              ? e.ciudadesIds
              : Array.isArray(e.ciudades)
                ? e.ciudades
                    .map((c: any) => (typeof c === 'object' ? c._id : c))
                    .filter((x: any) => /^[a-f\d]{24}$/i.test(x))
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

            // Provincia precargada (la deriva el backend de la 1ª ciudad).
            this.provinciaSel = e.provinciaId ?? null;

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
      isTwoForOne: true,
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

    // Todas las promos son 2x1 (no editable) → siempre true.
    d.isTwoForOne = true;

    // Campos que no pertenecen a detallePromocion principal
    delete d.rating;
    delete d.distanceLabel;
    delete d.startDate;
    delete d.endDate;
    delete d.isFlash;

    // Si se subió una imagen nueva (base64), se envía esa y se descarta la URL vieja.
    // Si NO se subió nada, se conserva la URL existente para no borrar la imagen.
    if (d.imageBase64) {
      delete d.imageUrl;
    } else {
      delete d.imageBase64;
    }
    if (d.logoBase64) {
      delete d.logoUrl;
    } else {
      delete d.logoBase64;
    }

    // Galería: enviar solo lo necesario. Items nuevos van con base64+type;
    // items existentes van con url+type. El backend convierte base64 → url.
    if (Array.isArray(d.galeria)) {
      d.galeria = d.galeria
        .map((item: any) => {
          const type = item?.type === 'video' ? 'video' : 'image';
          if (item?.base64) return { base64: item.base64, type };
          if (item?.url) return { url: item.url, type };
          return null;
        })
        .filter(Boolean)
        .slice(0, this.MAX_GALERIA);
    } else {
      delete d.galeria;
    }

    // Catálogo: items nuevos van con base64; existentes con url. Sin límite.
    // Se descartan productos sin foto. El backend convierte base64 → url.
    if (Array.isArray(d.productos)) {
      d.productos = d.productos
        .map((p: any) => {
          if (!p?.base64 && !p?.url) return null;
          const out: any = {
            nombre: (p?.nombre ?? '').trim(),
            descripcion: (p?.descripcion ?? '').trim(),
          };
          if (p.base64) out.base64 = p.base64;
          else out.url = p.url;
          return out;
        })
        .filter(Boolean);
    } else {
      delete d.productos;
    }

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
        clean.isTwoForOne = true; // siempre 2x1 (no editable)
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
    input.value = ''; // permitir volver a elegir el mismo archivo

    if (!file.type.startsWith('image/')) {
      this.alert.warning('Archivo inválido', 'Solo se permiten imágenes.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.alert.warning('Archivo muy grande', 'La imagen no debe superar los 5 MB.');
      return;
    }

    this.abrirRecorte(
      file,
      field,
      field === 'logoBase64' ? 'Recortar logo' : 'Recortar imagen',
    );
  }

  // ===== Recorte =====
  private abrirRecorte(
    file: File,
    target: 'imageBase64' | 'logoBase64' | 'galeria' | 'producto',
    title: string,
    galeriaIndex: number | null = null,
    productoIndex: number | null = null,
  ) {
    this.cropperFile = file;
    this.cropperTarget = target;
    this.cropperTitle = title;
    this.cropperGaleriaIndex = galeriaIndex;
    this.cropperProductoIndex = productoIndex;
    this.cropperVisible = true;
  }

  onCropConfirm(base64: string) {
    if (this.cropperTarget === 'galeria') {
      const g = this.model.detallePromocion.galeria;
      if (this.cropperGaleriaIndex !== null && g[this.cropperGaleriaIndex]) {
        // Reemplazar foto existente conservando su posición
        g[this.cropperGaleriaIndex] = { type: 'image', base64 };
      } else if (g.length < this.MAX_GALERIA) {
        g.push({ type: 'image', base64 });
      }
    } else if (this.cropperTarget === 'producto') {
      const p = this.model.detallePromocion.productos;
      if (this.cropperProductoIndex !== null && p[this.cropperProductoIndex]) {
        // Asignar/reemplazar la foto del producto existente
        p[this.cropperProductoIndex].base64 = base64;
        delete (p[this.cropperProductoIndex] as any).url;
      }
    } else {
      this.model.detallePromocion[this.cropperTarget] = base64;
    }
    this.cerrarRecorte();
  }

  cerrarRecorte() {
    this.cropperVisible = false;
    this.cropperFile = null;
    this.cropperGaleriaIndex = null;
    this.cropperProductoIndex = null;
  }

  // ===== Galería (hasta 5 fotos o videos) =====
  /** Foto de galería: pasa por el recortador */
  onGaleriaImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    input.value = '';

    if (this.model.detallePromocion.galeria.length >= this.MAX_GALERIA) {
      this.alert.warning('Límite alcanzado', `Máximo ${this.MAX_GALERIA} elementos en la galería.`);
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.alert.warning('Archivo inválido', 'Solo se permiten imágenes.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.alert.warning('Archivo muy grande', 'La imagen no debe superar los 5 MB.');
      return;
    }
    this.abrirRecorte(file, 'galeria', 'Recortar foto de galería');
  }

  /** Video de galería: se sube tal cual (sin recorte), validando tamaño */
  onGaleriaVideo(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    input.value = '';

    if (this.model.detallePromocion.galeria.length >= this.MAX_GALERIA) {
      this.alert.warning('Límite alcanzado', `Máximo ${this.MAX_GALERIA} elementos en la galería.`);
      return;
    }
    if (!file.type.startsWith('video/')) {
      this.alert.warning('Archivo inválido', 'Solo se permiten videos.');
      return;
    }
    if (file.size > this.MAX_VIDEO_MB * 1024 * 1024) {
      this.alert.warning('Video muy grande', `El video no debe superar los ${this.MAX_VIDEO_MB} MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.model.detallePromocion.galeria.push({
        type: 'video',
        base64: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  }

  /** Editar/reemplazar un item existente de la galería (según su tipo) */
  onGaleriaEditarFoto(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    input.value = '';

    if (!file.type.startsWith('image/')) {
      this.alert.warning('Archivo inválido', 'Solo se permiten imágenes.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.alert.warning('Archivo muy grande', 'La imagen no debe superar los 5 MB.');
      return;
    }
    this.abrirRecorte(file, 'galeria', 'Editar foto de galería', index);
  }

  onGaleriaEditarVideo(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    input.value = '';

    if (!file.type.startsWith('video/')) {
      this.alert.warning('Archivo inválido', 'Solo se permiten videos.');
      return;
    }
    if (file.size > this.MAX_VIDEO_MB * 1024 * 1024) {
      this.alert.warning('Video muy grande', `El video no debe superar los ${this.MAX_VIDEO_MB} MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const g = this.model.detallePromocion.galeria;
      if (g[index]) g[index] = { type: 'video', base64: reader.result as string };
    };
    reader.readAsDataURL(file);
  }

  removeGaleria(i: number) {
    this.model.detallePromocion.galeria.splice(i, 1);
  }

  /** Reordenar: mover un item de la galería a izquierda (-1) o derecha (+1) */
  moveGaleria(i: number, dir: -1 | 1) {
    const g = this.model.detallePromocion.galeria;
    const j = i + dir;
    if (j < 0 || j >= g.length) return;
    [g[i], g[j]] = [g[j], g[i]];
  }

  /** Fuente para previsualizar un item de galería */
  galeriaPreview(item: { url?: string; base64?: string }) {
    return item.base64 || item.url || '';
  }

  // ===== Catálogo de productos (sin límite) =====
  /** Agrega un producto vacío (nombre/descripción se llenan inline, foto con el recortador) */
  addProducto() {
    this.model.detallePromocion.productos.push({ nombre: '', descripcion: '' });
  }

  removeProducto(i: number) {
    this.model.detallePromocion.productos.splice(i, 1);
  }

  /** Reordenar: mover un producto a izquierda (-1) o derecha (+1) */
  moveProducto(i: number, dir: -1 | 1) {
    const p = this.model.detallePromocion.productos;
    const j = i + dir;
    if (j < 0 || j >= p.length) return;
    [p[i], p[j]] = [p[j], p[i]];
  }

  /** Selecciona/recorta la foto de un producto */
  onProductoImagen(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    input.value = '';

    if (!file.type.startsWith('image/')) {
      this.alert.warning('Archivo inválido', 'Solo se permiten imágenes.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.alert.warning('Archivo muy grande', 'La imagen no debe superar los 5 MB.');
      return;
    }
    this.abrirRecorte(file, 'producto', 'Recortar foto del producto', null, index);
  }

  /** Fuente para previsualizar la foto de un producto */
  productoPreview(item: { url?: string; base64?: string }) {
    return item.base64 || item.url || '';
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

  // ── Validadores por sección (acumulan en `e`) ──
  private _valDatos(e: Record<string, string>) {
    if (!this.model.nombre?.trim()) e['nombre'] = 'El nombre es obligatorio';

    const email = this.model.email?.trim();
    if (!email) e['email'] = 'El email es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e['email'] = 'Ingresa un email válido';

    const tel = this.model.telefono?.trim();
    if (tel && !/^[0-9]{7,10}$/.test(tel.replace(/^0/, '')))
      e['telefono'] = 'Ingresa un número válido (7-10 dígitos)';

    const id = this.model.identificacion?.trim();
    if (!id) e['identificacion'] = 'La identificación es obligatoria';
    else if (!/^\d{10}(\d{3})?$/.test(id))
      e['identificacion'] = 'CI (10 dígitos) o RUC (13 dígitos)';
  }

  private _valUbicacion(e: Record<string, string>) {
    if (!this.provinciaSel) e['provincia'] = 'Selecciona la provincia';
    if (!this.model.ciudades?.length)
      e['ciudades'] = 'Selecciona al menos una ciudad';
    if (!this.model.categorias?.length)
      e['categorias'] = 'Selecciona al menos una categoría';
  }

  /** Al cambiar de provincia, limpia las ciudades elegidas (eran de otra provincia). */
  onProvinciaChange(id: string | null) {
    if (id !== this.provinciaSel) {
      this.provinciaSel = id;
      this.model.ciudades = [];
    }
  }

  private _valPromocion(e: Record<string, string>) {
    if (!this.model.detallePromocion.title?.trim())
      e['title'] = 'El título de la promoción es obligatorio';
    if (!this.model.detallePromocion.scheduleLabel?.trim())
      e['scheduleLabel'] = 'El horario es obligatorio (ej: Lun-Dom 10:00–19:00)';
    if (
      !this.model.detallePromocion.aplicaTodosLosDias &&
      !this.model.detallePromocion.diasAplicables?.length
    ) {
      e['dias'] = 'Selecciona al menos un día o marca "Aplica todos los días"';
    }
  }

  private _valCatalogo(e: Record<string, string>) {
    const productos = this.model.detallePromocion.productos ?? [];
    productos.forEach((p: any, i: number) => {
      const tieneFoto = !!(p?.base64 || p?.url);
      const tieneNombre = !!p?.nombre?.trim();
      if (tieneFoto && !tieneNombre)
        e[`producto_${i}`] = `Producto ${i + 1}: falta el nombre`;
      if (tieneNombre && !tieneFoto)
        e[`producto_${i}`] = `Producto ${i + 1}: falta la foto`;
    });
  }

  /** Valida solo los campos del paso indicado; muestra errores inline (sin alert). */
  validateStep(stepId: string): boolean {
    const e: Record<string, string> = {};
    switch (stepId) {
      case 'datos':
        this._valDatos(e);
        break;
      case 'ubicacion':
        this._valUbicacion(e);
        break;
      case 'promocion':
        this._valPromocion(e);
        break;
      case 'catalogo':
        this._valCatalogo(e);
        break;
      case 'resumen':
        return this.validate();
      // 'imagenes' no tiene campos obligatorios
    }
    this.errors = e;
    if (Object.keys(e).length > 0) {
      this.alert.warning('Revisa este paso', Object.values(e).join('\n'));
      return false;
    }
    return true;
  }

  /** Validación completa (todos los pasos) — usada al guardar desde el resumen. */
  validate(): boolean {
    const e: Record<string, string> = {};
    // Solo valida los grupos visibles para el rol.
    if (!this.soloFotos) {
      this._valDatos(e);
      this._valUbicacion(e);
      this._valPromocion(e);
    }
    if (!this.soloDetalles) {
      this._valCatalogo(e);
    }
    this.errors = e;
    if (Object.keys(e).length > 0) {
      this.alert.warning('Formulario incompleto', Object.values(e).join('\n'));
      return false;
    }
    return true;
  }

  /** Resumen de campos faltantes para mostrar en el paso final. */
  get faltantes(): string[] {
    const e: Record<string, string> = {};
    if (!this.soloFotos) {
      this._valDatos(e);
      this._valUbicacion(e);
      this._valPromocion(e);
    }
    if (!this.soloDetalles) this._valCatalogo(e);
    return Object.values(e);
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

  // ===== Mapa Leaflet (seleccionar ubicación en un modal) =====

  /** Ícono por defecto de Leaflet servido por CDN (evita problemas de assets). */
  private readonly leafletIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  abrirMapa() {
    this.mapSeleccion = this.model.ubicacion ? { ...this.model.ubicacion } : null;
    this.mapaAbierto = true;
    // Espera a que el contenedor del modal exista en el DOM.
    setTimeout(() => this.initMapa(), 100);
  }

  private initMapa() {
    const base = this.mapSeleccion ?? { lat: -0.22985, lng: -78.52495 }; // Quito por defecto
    const zoom = this.mapSeleccion ? 16 : 12;

    this.map = L.map('mapa-ubicacion', { center: [base.lat, base.lng], zoom });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(this.map);

    if (this.mapSeleccion) {
      this.colocarMarcador([this.mapSeleccion.lat, this.mapSeleccion.lng]);
    }

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.mapSeleccion = {
        lat: +e.latlng.lat.toFixed(7),
        lng: +e.latlng.lng.toFixed(7),
      };
      this.colocarMarcador(e.latlng);
    });

    // Corrige el tamaño del mapa cuando el modal recién se abre.
    setTimeout(() => this.map?.invalidateSize(), 150);
  }

  private colocarMarcador(latlng: L.LatLngExpression) {
    if (this.marker) {
      this.marker.setLatLng(latlng);
      return;
    }
    this.marker = L.marker(latlng, { icon: this.leafletIcon, draggable: true }).addTo(
      this.map!,
    );
    this.marker.on('dragend', () => {
      const p = this.marker!.getLatLng();
      this.mapSeleccion = { lat: +p.lat.toFixed(7), lng: +p.lng.toFixed(7) };
    });
  }

  confirmarMapa() {
    if (this.mapSeleccion) {
      this.model.ubicacion = { ...this.mapSeleccion };
      this.reverseGeocode(this.mapSeleccion.lat, this.mapSeleccion.lng);
    }
    this.cerrarMapa();
  }

  cerrarMapa() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.marker = null;
    this.mapaAbierto = false;
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
