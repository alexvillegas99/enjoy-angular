import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EstablecimientosService {
  private http = inject(HttpClient);
  private base = `${environment.api}usuarios`;

  listar(params: { page?: number; limit?: number; q?: string }) {
    return this.http.get<{
      page: number;
      limit: number;
      total: number;
      pages: number;
      items: any[];
    }>(`${this.base}/establecimientos`, { params: params as any });
  }
  obtener(id: string) {
    return this.http.get<any>(`${this.base}/${id}`);
  }

  getDetalle(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/${id}`);
  }

  /** Actualizar establecimiento */
  update(id: string, data: any): Observable<any> {
    return this.http.patch<any>(`${this.base}/${id}`, data);
  }

    /** Crear establecimiento */
  create(data: any): Observable<any> {
    return this.http.post<any>(this.base, data);
  }
}
