import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface PromotorDefaults {
  descuento: number;
  comision: number;
}

export interface PromotorStats {
  isPromotor: boolean;
  codigoDescuento?: string;
  porcentajeDescuento?: number;
  porcentajeComision?: number;
  saldoPromotor?: number;
}

export interface ReportePromotorItem {
  promotorId: string;
  nombre: string;
  email: string | null;
  codigo: string;
  ventas: number;
  montoBruto: number;
  totalDescuento: number;
  totalComision: number;
  comisionAcreditada: number;
  saldoActual: number;
}

export interface ReportePromotores {
  rango: { desde: string; hasta: string };
  totales: {
    ventas: number;
    montoBruto: number;
    totalDescuento: number;
    totalComision: number;
  };
  promotores: ReportePromotorItem[];
}

@Injectable({ providedIn: 'root' })
export class PromotorService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api}clientes`;
  private reportesUrl = `${environment.api}reportes`;

  defaults() {
    return this.http.get<PromotorDefaults>(`${this.baseUrl}/promotor/defaults`);
  }

  activar(
    clienteId: string,
    body: {
      codigoDescuento: string;
      porcentajeDescuento?: number | null;
      porcentajeComision?: number | null;
    },
  ) {
    return this.http.patch<any>(
      `${this.baseUrl}/${clienteId}/promotor/activar`,
      body,
    );
  }

  desactivar(clienteId: string) {
    return this.http.patch<any>(
      `${this.baseUrl}/${clienteId}/promotor/desactivar`,
      {},
    );
  }

  reporte(rango: { desde?: string; hasta?: string } = {}) {
    let p = new HttpParams();
    if (rango.desde) p = p.set('desde', rango.desde);
    if (rango.hasta) p = p.set('hasta', rango.hasta);
    return this.http.get<ReportePromotores>(`${this.reportesUrl}/promotores`, {
      params: p,
    });
  }
}
