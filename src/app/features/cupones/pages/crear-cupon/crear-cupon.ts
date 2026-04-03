// src/app/components/crear-cupon/crear-cupon.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { VersionCuponeraService } from '../../../../services/version-cuponera.service';
import { CuponService } from '../../../../services/cupones.service';
import { AlertService } from '../../../../core/services/alert.service';
import { ClientesService } from '../../../../services/cliente.service';

@Component({
  selector: 'app-crear-cupon',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './crear-cupon.html',
})
export class CrearCupon implements OnInit {
  private clientesService = inject(ClientesService);
  private versionCuponeraService = inject(VersionCuponeraService);
  private cuponService = inject(CuponService);
  private alert = inject(AlertService);

  // 🔐 usuario logueado (mock)
  usuarioActivadorId = '6870839a0c046d4195db7247';

  // 👤 clientes
  searchCliente = '';
  clientes: any[] = [];
  cliente: any = null;
  loadingClientes = false;

  // 📦 versiones de cuponera
  searchVersion = '';
  versiones: any[] = [];
  version: any = null;
  loadingVersiones = false;

  // Estado para mostrar/ocultar dropdown de versiones
  mostrarDropdownVersiones = false;

  private searchCliente$ = new Subject<string>();
  private searchVersion$ = new Subject<string>();

  ngOnInit() {
    // 🔍 Configurar búsqueda de clientes
    this.searchCliente$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((q) => {
          this.loadingClientes = true;
          return this.clientesService.buscar(q);
        }),
      )
      .subscribe({
        next: (res) => {
          this.clientes = res;
          this.loadingClientes = false;
        },
        error: () => {
          this.clientes = [];
          this.loadingClientes = false;
        },
      });

    // 🔍 Configurar búsqueda de versiones
    this.searchVersion$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((nombre) => {
          if (!nombre || nombre.length < 2) {
            return this.versionCuponeraService.obtenerActivas();
          }
          this.loadingVersiones = true;
          return this.versionCuponeraService.buscarPorNombre(nombre, 'true');
        }),
      )
      .subscribe({
        next: (versiones) => {
          this.versiones = versiones;
          this.loadingVersiones = false;
        },
        error: () => {
          this.versiones = [];
          this.loadingVersiones = false;
        },
      });

    // Cargar versiones activas al iniciar
    this.cargarVersionesActivas();
  }

  /**
   * Cargar versiones activas iniciales
   */
  cargarVersionesActivas() {
    this.loadingVersiones = true;
    this.versionCuponeraService.obtenerActivas().subscribe({
      next: (versiones) => {
        this.versiones = versiones;
        this.loadingVersiones = false;
      },
      error: () => {
        this.versiones = [];
        this.loadingVersiones = false;
      },
    });
  }

  // 📋 Métodos para clientes
  onSearchCliente(value: string) {
    this.searchCliente = value;

    if (!value || value.length < 2) {
      this.clientes = [];
      return;
    }

    this.searchCliente$.next(value);
  }

 seleccionarCliente(c: any) {
  this.cliente = c;
  this.searchCliente = `${c.nombres} ${c.apellidos}`;
  this.clientes = [];
  this.actualizarPreview();
}



  limpiarCliente() {
    this.cliente = null;
    this.searchCliente = '';
  }

  // 📋 Métodos para versiones
  onSearchVersion(value: string) {
    this.searchVersion = value;
    this.mostrarDropdownVersiones = true;

    if (value.length >= 2 || value === '') {
      this.searchVersion$.next(value);
    }
  }

 seleccionarVersion(v: any) {
  this.version = v;
  this.searchVersion = v.nombre;
  this.mostrarDropdownVersiones = false;
  this.versiones = [];
  this.actualizarPreview();
}


  limpiarVersion() {
    this.version = null;
    this.searchVersion = '';
    this.cargarVersionesActivas();
    this.mostrarDropdownVersiones = true;
  }

  cerrarDropdownVersiones() {
    setTimeout(() => {
      this.mostrarDropdownVersiones = false;
    }, 200);
  }
fechaActivacionPreview: string | null = null;
private actualizarPreview() {
  if (!this.cliente || !this.version) {
    this.fechaActivacionPreview = null;
    return;
  }

  if (!this.fechaActivacionPreview) {
    this.fechaActivacionPreview = new Date().toISOString();
  }
}

  // 👁️ preview automático
 get previewCupon() {
  if (!this.cliente || !this.version || !this.fechaActivacionPreview) {
    return null;
  }

  return {
    secuencial: 0,
    estado: 'activo',
    numeroDeEscaneos: 0,
    fechaActivacion: this.fechaActivacionPreview,
    fechaVencimiento: null,
    version: this.version._id,
    versionNombre: this.version.nombre,
    cliente: this.cliente._id,
    clienteNombre: `${this.cliente.nombres} ${this.cliente.apellidos}`,
    usuarioActivador: this.usuarioActivadorId,
  };
}

  // Estado de creación
  creandoCupon = false;
  mensajeError: string | null = null;
  mensajeExito: string | null = null;

  async crearCupon() {
    if (!this.cliente || !this.version) {
      this.alert.warning(
        'Datos incompletos',
        'Debe seleccionar un cliente y una versión',
      );
      return;
    }

    const confirmar = await this.alert.confirm({
      title: 'Crear cupón',
      text: '¿Deseas crear el cupón para este cliente?',
      confirmText: 'Sí, crear',
    });

    if (!confirmar) return;

    const cuponData = {
      version: this.version._id,
      cliente: this.cliente._id,
      usuarioActivador: this.usuarioActivadorId,
    };

    this.creandoCupon = true;

    this.cuponService.crearCupon(cuponData).subscribe({
      next: (cuponCreado) => {
        this.creandoCupon = false;

        this.alert.success(
          'Cupón creado',
          ``,
        );

        this.restablecerFormulario();
      },
      error: (error) => {
        this.creandoCupon = false;

        this.alert.error(
          'Error al crear cupón',
          error.error?.message || 'Ocurrió un error inesperado',
        );
      },
    });
  }

  // Restablecer formulario
  restablecerFormulario() {
    this.cliente = null;
    this.version = null;
    this.searchCliente = '';
    this.searchVersion = '';
    this.mensajeExito = null;
    this.mensajeError = null;
    this.cargarVersionesActivas(); // Recargar versiones
  }
}
