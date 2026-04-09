import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AlertService } from '../../../../core/services/alert.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-configuracion-pagos',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './configuracion-pagos.html',
})
export class ConfiguracionPagos {
  private http = inject(HttpClient);
  private alert = inject(AlertService);
  private api = environment.api;

  loading = false;
  saving = false;

  // PayPhone
  payphoneActivo = false;
  payphoneToken = '';
  payphoneStoreId = '';

  // PayPal
  paypalActivo = false;
  paypalClientId = '';
  paypalSecret = '';
  paypalSandbox = true;

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.http.get<any>(`${this.api}configuracion`).subscribe({
      next: (configs: any[]) => {
        for (const c of configs) {
          if (c.clave === 'payphone_activo') this.payphoneActivo = c.valor === 'true';
          if (c.clave === 'payphone_token') this.payphoneToken = c.valor ?? '';
          if (c.clave === 'payphone_store_id') this.payphoneStoreId = c.valor ?? '';
          if (c.clave === 'paypal_activo') this.paypalActivo = c.valor === 'true';
          if (c.clave === 'paypal_client_id') this.paypalClientId = c.valor ?? '';
          if (c.clave === 'paypal_secret') this.paypalSecret = c.valor ?? '';
          if (c.clave === 'paypal_sandbox') this.paypalSandbox = c.valor !== 'false';
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.alert.error('Error', 'No se pudo cargar la configuración.');
      },
    });
  }

  guardar() {
    this.saving = true;

    const saves = [
      // PayPhone
      this.http.patch(`${this.api}configuracion/payphone_activo`, {
        valor: this.payphoneActivo ? 'true' : 'false',
        descripcion: 'PayPhone activo (true/false)',
      }),
      this.http.patch(`${this.api}configuracion/payphone_token`, {
        valor: this.payphoneToken,
        descripcion: 'Token API de PayPhone',
      }),
      this.http.patch(`${this.api}configuracion/payphone_store_id`, {
        valor: this.payphoneStoreId,
        descripcion: 'StoreID de PayPhone (sucursal)',
      }),
      // PayPal
      this.http.patch(`${this.api}configuracion/paypal_activo`, {
        valor: this.paypalActivo ? 'true' : 'false',
        descripcion: 'PayPal activo (true/false)',
      }),
      this.http.patch(`${this.api}configuracion/paypal_client_id`, {
        valor: this.paypalClientId,
        descripcion: 'PayPal Client ID',
      }),
      this.http.patch(`${this.api}configuracion/paypal_secret`, {
        valor: this.paypalSecret,
        descripcion: 'PayPal Secret Key',
      }),
      this.http.patch(`${this.api}configuracion/paypal_sandbox`, {
        valor: this.paypalSandbox ? 'true' : 'false',
        descripcion: 'PayPal modo sandbox (true/false)',
      }),
    ];

    Promise.all(saves.map((s) => s.toPromise())).then(() => {
      this.saving = false;
      this.alert.success('Configuración guardada');
    }).catch(() => {
      this.saving = false;
      this.alert.error('Error', 'No se pudo guardar.');
    });
  }
}
