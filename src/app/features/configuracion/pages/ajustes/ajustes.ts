import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ConfiguracionService, Configuracion } from '../../../../services/configuracion.service';
import { AlertService } from '../../../../core/services/alert.service';

interface ConfigUI extends Configuracion {
  editando: boolean;
  valorTemp: string;
  esJson: boolean;
  jsonData: any[] | null;
  jsonKeys: string[];
}

@Component({
  selector: 'app-ajustes',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './ajustes.html',
})
export class Ajustes implements OnInit {
  private svc = inject(ConfiguracionService);
  private alert = inject(AlertService);

  loading = true;
  configs: ConfigUI[] = [];

  nuevaClave = '';
  nuevoValor = '';
  nuevaDescripcion = '';
  mostrarNuevo = false;

  ngOnInit() {
    this.cargar();
  }

  private readonly CLAVES_PAGOS = [
    'payphone_activo', 'payphone_token', 'payphone_store_id',
    'paypal_activo', 'paypal_client_id', 'paypal_secret', 'paypal_sandbox',
  ];

  cargar() {
    this.loading = true;
    this.svc.listar().subscribe({
      next: (data) => {
        this.configs = data
          .filter((c) => !this.CLAVES_PAGOS.includes(c.clave))
          .map((c) => this.mapConfig(c));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.alert.error('Error', 'No se pudieron cargar las configuraciones.');
      },
    });
  }

  private mapConfig(c: Configuracion): ConfigUI {
    const parsed = this.tryParseJson(c.valor);
    return {
      ...c,
      editando: false,
      valorTemp: c.valor,
      esJson: parsed !== null,
      jsonData: parsed,
      jsonKeys: parsed && parsed.length > 0 ? Object.keys(parsed[0]) : [],
    };
  }

  private tryParseJson(valor: string): any[] | null {
    try {
      const parsed = JSON.parse(valor);
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
        return parsed;
      }
    } catch {}
    return null;
  }

  editar(config: ConfigUI) {
    config.editando = true;
    config.valorTemp = config.valor;
    if (config.esJson) {
      config.jsonData = JSON.parse(config.valor);
      config.jsonKeys = config.jsonData!.length > 0 ? Object.keys(config.jsonData![0]) : [];
    }
  }

  cancelar(config: ConfigUI) {
    config.editando = false;
    config.valorTemp = config.valor;
    if (config.esJson) {
      config.jsonData = JSON.parse(config.valor);
    }
  }

  guardar(config: ConfigUI) {
    let valorFinal: string;

    if (config.esJson && config.jsonData) {
      valorFinal = JSON.stringify(config.jsonData);
    } else {
      valorFinal = config.valorTemp?.trim();
    }

    if (!valorFinal) {
      this.alert.warning('Campo vacío', 'El valor no puede estar vacío.');
      return;
    }

    this.svc.actualizar(config.clave, { valor: valorFinal }).subscribe({
      next: (updated) => {
        config.valor = updated.valor;
        config.editando = false;
        const parsed = this.tryParseJson(updated.valor);
        config.esJson = parsed !== null;
        config.jsonData = parsed;
        config.jsonKeys = parsed && parsed.length > 0 ? Object.keys(parsed[0]) : [];
        this.alert.success('Guardado', `"${config.clave}" actualizado correctamente.`);
      },
      error: () => {
        this.alert.error('Error', 'No se pudo guardar la configuración.');
      },
    });
  }

  // JSON array helpers
  addJsonRow(config: ConfigUI) {
    if (!config.jsonData || !config.jsonKeys.length) return;
    const newRow: any = {};
    for (const key of config.jsonKeys) {
      newRow[key] = '';
    }
    config.jsonData.push(newRow);
  }

  removeJsonRow(config: ConfigUI, index: number) {
    if (!config.jsonData) return;
    config.jsonData.splice(index, 1);
  }

  agregarNueva() {
    const clave = this.nuevaClave.trim();
    const valor = this.nuevoValor.trim();
    if (!clave || !valor) {
      this.alert.warning('Campos vacíos', 'Clave y valor son obligatorios.');
      return;
    }

    this.svc.actualizar(clave, { valor, descripcion: this.nuevaDescripcion.trim() }).subscribe({
      next: () => {
        this.nuevaClave = '';
        this.nuevoValor = '';
        this.nuevaDescripcion = '';
        this.mostrarNuevo = false;
        this.cargar();
        this.alert.success('Creada', `Configuración "${clave}" agregada.`);
      },
      error: () => {
        this.alert.error('Error', 'No se pudo crear la configuración.');
      },
    });
  }

  getIcono(clave: string): string {
    if (clave.includes('whatsapp')) return 'message-circle';
    if (clave.includes('telefono') || clave.includes('numero')) return 'phone';
    if (clave.includes('email') || clave.includes('correo')) return 'mail';
    if (clave.includes('cuponera') || clave.includes('precio')) return 'ticket';
    if (clave.includes('cuenta') || clave.includes('banco')) return 'landmark';
    if (clave.includes('instrucciones')) return 'info';
    return 'settings';
  }

  labelForKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();
  }
}
