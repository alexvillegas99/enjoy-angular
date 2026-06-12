import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface RangoFechas {
  desde?: string;
  hasta?: string;
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api}reportes`;

  private params(r: RangoFechas, extra: Record<string, any> = {}) {
    let p = new HttpParams();
    if (r.desde) p = p.set('desde', r.desde);
    if (r.hasta) p = p.set('hasta', r.hasta);
    for (const [k, v] of Object.entries(extra)) {
      if (v !== undefined && v !== null) p = p.set(k, String(v));
    }
    return p;
  }

  canjes(r: RangoFechas, granularidad: 'dia' | 'semana' | 'mes' = 'dia') {
    return this.http.get<any>(`${this.baseUrl}/canjes`, {
      params: this.params(r, { granularidad }),
    });
  }

  ingresos(r: RangoFechas) {
    return this.http.get<any>(`${this.baseUrl}/ingresos`, {
      params: this.params(r),
    });
  }

  locales(r: RangoFechas, limit = 25) {
    return this.http.get<any>(`${this.baseUrl}/locales`, {
      params: this.params(r, { limit }),
    });
  }

  vendedores(r: RangoFechas) {
    return this.http.get<any>(`${this.baseUrl}/vendedores`, {
      params: this.params(r),
    });
  }

  creador(id: string, r: RangoFechas) {
    return this.http.get<any>(`${this.baseUrl}/creador/${id}`, {
      params: this.params(r),
    });
  }

  clientes(r: RangoFechas) {
    return this.http.get<any>(`${this.baseUrl}/clientes`, {
      params: this.params(r),
    });
  }

  flash(r: RangoFechas) {
    return this.http.get<any>(`${this.baseUrl}/flash`, {
      params: this.params(r),
    });
  }

  solicitudes(r: RangoFechas) {
    return this.http.get<any>(`${this.baseUrl}/solicitudes`, {
      params: this.params(r),
    });
  }
}
