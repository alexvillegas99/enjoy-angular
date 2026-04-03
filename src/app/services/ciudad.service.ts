import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class CiudadesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api}ciudades`;

  /** Crear ciudad */
  crear(data: Partial<any>): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  /** Listar ciudades con filtros */
  listar(params?: {
    q?: string;
    estado?: boolean;
    page?: number;
    limit?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();

    if (params?.q) httpParams = httpParams.set('q', params.q);
    if (params?.estado !== undefined)
      httpParams = httpParams.set('estado', String(params.estado));
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit);

    return this.http.get<any>(this.baseUrl, {
      params: httpParams,
    });
  }

  /** Obtener ciudad por ID */
  obtenerPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  /** Actualizar ciudad */
  actualizar(id: string, data: Partial<any>): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, data);
  }

  /** Activar ciudad */
  activar(id: string): Observable<any> {
    return this.http.patch<any>(
      `${this.baseUrl}/${id}/activar`,
      {},
    );
  }

  /** Desactivar ciudad */
  desactivar(id: string): Observable<any> {
    return this.http.patch<any>(
      `${this.baseUrl}/${id}/desactivar`,
      {},
    );
  }

  /** Eliminar ciudad */
  eliminar(id: string): Observable<{ ok: true }> {
    return this.http.delete<{ ok: true }>(`${this.baseUrl}/${id}`);
  }

  /** Ciudades visibles para registro */
  obtenerParaRegistro(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/registro`);
  }

  /** Ciudades activas para promociones */
  obtenerParaPromociones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/promociones`);
  }
}
