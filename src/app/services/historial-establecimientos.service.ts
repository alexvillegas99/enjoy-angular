import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HistorialEstablecimientosService {
  private http = inject(HttpClient);
  private base = `${environment.api}historial-establecimientos`;

  listar(params?: { estado?: string; page?: number; limit?: number }): Observable<any> {
    let p = new HttpParams();
    if (params?.estado) p = p.set('estado', params.estado);
    if (params?.page) p = p.set('page', String(params.page));
    if (params?.limit) p = p.set('limit', String(params.limit));
    return this.http.get<any>(this.base, { params: p });
  }

  contarPendientes(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.base}/pendientes/count`);
  }

  obtener(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/${id}`);
  }

  aprobar(id: string): Observable<any> {
    return this.http.patch<any>(`${this.base}/${id}/aprobar`, {});
  }

  revertir(id: string): Observable<any> {
    return this.http.patch<any>(`${this.base}/${id}/revertir`, {});
  }
}
