import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Provincia {
  _id: string;
  nombre: string;
  codigo?: string;
  estado: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProvinciasService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api}provincias`;

  listar(params?: { q?: string; estado?: boolean }): Observable<Provincia[]> {
    let httpParams = new HttpParams();
    if (params?.q) httpParams = httpParams.set('q', params.q);
    if (params?.estado !== undefined)
      httpParams = httpParams.set('estado', String(params.estado));
    return this.http.get<Provincia[]>(this.baseUrl, { params: httpParams });
  }

  getActivas(): Observable<Provincia[]> {
    return this.http.get<Provincia[]>(`${this.baseUrl}/activas`);
  }

  obtenerPorId(id: string): Observable<Provincia> {
    return this.http.get<Provincia>(`${this.baseUrl}/${id}`);
  }

  crear(data: Partial<Provincia>): Observable<Provincia> {
    return this.http.post<Provincia>(this.baseUrl, data);
  }

  actualizar(id: string, data: Partial<Provincia>): Observable<Provincia> {
    return this.http.patch<Provincia>(`${this.baseUrl}/${id}`, data);
  }

  activar(id: string): Observable<Provincia> {
    return this.http.patch<Provincia>(`${this.baseUrl}/${id}/activar`, {});
  }

  desactivar(id: string): Observable<Provincia> {
    return this.http.patch<Provincia>(`${this.baseUrl}/${id}/desactivar`, {});
  }

  eliminar(id: string): Observable<{ ok: true }> {
    return this.http.delete<{ ok: true }>(`${this.baseUrl}/${id}`);
  }
}
