import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { HttpClient } from '@angular/common/http';
import { ClientesService } from '../../../../services/cliente.service';
import { AlertService } from '../../../../core/services/alert.service';
import { environment } from '../../../../../environments/environment';
import { PromotorService } from '../../../../services/promotor.service';

@Component({
  selector: 'app-editar-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterLink],
  templateUrl: './editar-cliente.html',
})
export class EditarCliente {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private svc = inject(ClientesService);
  private alert = inject(AlertService);
  private promotorSvc = inject(PromotorService);

  isEdit = false;
  loading = false;
  cargando = true;

  errors: Record<string, string> = {};

  // ── Sección Promotor ──────────────────────────────────────────────
  promotor = {
    isPromotor: false,
    codigoDescuento: '',
    porcentajeDescuento: null as number | null,
    porcentajeComision: null as number | null,
    saldoPromotor: 0,
  };
  promotorDefaults = { descuento: 20, comision: 20 };
  guardandoPromotor = false;

  model = {
    _id: '',
    nombres: '',
    apellidos: '',
    tipoIdentificacion: 'CEDULA' as 'CEDULA' | 'RUC' | 'PASAPORTE',
    identificacion: '',
    email: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: null as Date | null,
    estado: true,
  };

  /** Carga defaults globales (%) y pobla la sección promotor del cliente. */
  private _cargarPromotor(data: any) {
    this.promotor = {
      isPromotor: data?.isPromotor === true,
      codigoDescuento: (data?.codigoDescuento ?? '').toString(),
      porcentajeDescuento: data?.porcentajeDescuento ?? null,
      porcentajeComision: data?.porcentajeComision ?? null,
      saldoPromotor: Number(data?.saldoPromotor ?? 0),
    };
    this.promotorSvc.defaults().subscribe({
      next: (d) => (this.promotorDefaults = d),
      error: () => {},
    });
  }

  async activarPromotor() {
    const codigo = (this.promotor.codigoDescuento || '').trim().toUpperCase();
    if (!codigo) {
      this.alert.warning(
        'Falta el código',
        'Definí un código (3-20 caracteres alfanuméricos) para activar al promotor.',
      );
      return;
    }
    this.guardandoPromotor = true;
    this.promotorSvc
      .activar(this.model._id, {
        codigoDescuento: codigo,
        porcentajeDescuento: this.promotor.porcentajeDescuento,
        porcentajeComision: this.promotor.porcentajeComision,
      })
      .subscribe({
        next: (cli) => {
          this.guardandoPromotor = false;
          this.promotor.isPromotor = true;
          this.promotor.codigoDescuento = cli?.codigoDescuento ?? codigo;
          this.alert.success(
            cli?.isPromotor ? 'Promotor activo' : 'Guardado',
            `Código "${this.promotor.codigoDescuento}" listo para usar.`,
          );
        },
        error: (e) => {
          this.guardandoPromotor = false;
          this.alert.error(
            'No se pudo guardar',
            e?.error?.message || 'Verificá el código (podría ya estar en uso).',
          );
        },
      });
  }

  async desactivarPromotor() {
    const ok = await this.alert.confirm({
      title: 'Desactivar promotor',
      text: 'El código dejará de funcionar para nuevos clientes. El saldo acumulado se mantiene.',
      confirmText: 'Sí, desactivar',
      icon: 'warning',
    });
    if (!ok) return;
    this.guardandoPromotor = true;
    this.promotorSvc.desactivar(this.model._id).subscribe({
      next: () => {
        this.guardandoPromotor = false;
        this.promotor.isPromotor = false;
        this.promotor.codigoDescuento = '';
        this.alert.success('Desactivado', 'El cliente ya no es promotor.');
      },
      error: (e) => {
        this.guardandoPromotor = false;
        this.alert.error('Error', e?.error?.message || 'No se pudo desactivar.');
      },
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;

    if (id) {
      this.svc.findById(id).subscribe({
        next: (data: any) => {
          this.model = {
            ...this.model,
            ...data,
            fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
          };
          this._cargarPromotor(data);
          this.cargando = false;
        },
        error: (err) => {
          this.cargando = false;
          this.alert.error('Error al cargar', this.extraerMensajeError(err));
        },
      });
    } else {
      this.cargando = false;
    }
  }

  onFechaNacimiento(event: Event) {
    const input = event.target as HTMLInputElement;
    this.model.fechaNacimiento = input.value ? new Date(input.value) : null;
  }

  submit() {
    if (!this.validate()) return;

    const payload: any = { ...this.model };

    // Formatear teléfono con código de país
    if (payload.telefono?.trim()) {
      payload.telefono = this.formatearTelefono(payload.telefono.trim());
    }

    // Limpiar campos vacíos opcionales
    if (!payload.direccion?.trim()) delete payload.direccion;
    if (!payload.telefono?.trim()) delete payload.telefono;
    if (!payload.fechaNacimiento) delete payload.fechaNacimiento;
    delete payload._id;

    this.loading = true;

    const req = this.isEdit
      ? this.http.put(`${environment.api}clientes/me/${this.model._id}`, payload)
      : this.svc.create(payload);

    req.subscribe({
      next: async () => {
        this.loading = false;
        await this.alert.success(
          this.isEdit ? 'Cliente actualizado' : 'Cliente creado',
          'La información se guardó correctamente.',
        );
        this.router.navigate(['/clientes']);
      },
      error: (err) => {
        this.loading = false;
        this.alert.error('Error al guardar', this.extraerMensajeError(err));
      },
    });
  }

  validate(): boolean {
    this.errors = {};

    if (!this.model.nombres?.trim())
      this.errors['nombres'] = 'Los nombres son obligatorios';

    if (!this.model.apellidos?.trim())
      this.errors['apellidos'] = 'Los apellidos son obligatorios';

    // Email
    const email = this.model.email?.trim();
    if (!email) {
      this.errors['email'] = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.errors['email'] = 'Ingresa un email válido';
    }

    // Identificación según tipo
    const id = this.model.identificacion?.trim();
    if (!id) {
      this.errors['identificacion'] = 'La identificación es obligatoria';
    } else {
      switch (this.model.tipoIdentificacion) {
        case 'CEDULA':
          if (!/^\d{10}$/.test(id))
            this.errors['identificacion'] = 'La cédula debe tener 10 dígitos';
          break;
        case 'RUC':
          if (!/^\d{13}$/.test(id))
            this.errors['identificacion'] = 'El RUC debe tener 13 dígitos';
          break;
        case 'PASAPORTE':
          if (id.length < 5)
            this.errors['identificacion'] = 'El pasaporte debe tener al menos 5 caracteres';
          break;
      }
    }

    // Teléfono (opcional pero si se llena debe ser válido)
    const tel = this.model.telefono?.trim();
    if (tel && !/^[0-9]{7,10}$/.test(tel.replace(/^0/, ''))) {
      this.errors['telefono'] = 'Ingresa un número válido (7-10 dígitos)';
    }

    if (Object.keys(this.errors).length > 0) {
      const mensajes = Object.values(this.errors).join('\n');
      this.alert.warning('Formulario incompleto', mensajes);
      return false;
    }

    return true;
  }

  private formatearTelefono(tel: string): string {
    if (!tel) return tel;
    let limpio = tel.replace(/\D/g, '');
    if (limpio.startsWith('593')) return `+${limpio}`;
    if (limpio.startsWith('0')) limpio = limpio.substring(1);
    return `+593${limpio}`;
  }

  private extraerMensajeError(err: any): string {
    const body = err?.error;
    const msg = body?.message;
    if (msg && typeof msg === 'object' && !Array.isArray(msg)) {
      if (typeof msg.message === 'string') return msg.message;
      if (Array.isArray(msg.message)) return msg.message.join(', ');
    }
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
    if (body?.error && typeof body.error === 'string') return body.error;
    if (err?.status === 0) return 'No se pudo conectar con el servidor.';
    if (err?.status === 409) return 'Ya existe un registro con estos datos.';
    if (err?.status === 404) return 'No se encontró el cliente.';
    if (err?.status === 403) return 'No tienes permisos para esta acción.';
    return 'Ocurrió un error inesperado. Intenta de nuevo.';
  }
}
