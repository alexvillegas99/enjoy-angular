import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CampanasService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api}campanas`;

  listar(opts: { page?: number; limit?: number; estado?: string } = {}) {
    let p = new HttpParams();
    if (opts.page) p = p.set('page', opts.page);
    if (opts.limit) p = p.set('limit', opts.limit);
    if (opts.estado) p = p.set('estado', opts.estado);
    return this.http.get<any>(this.baseUrl, { params: p });
  }

  obtener(id: string) {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  crear(body: any) {
    return this.http.post<any>(this.baseUrl, body);
  }

  actualizar(id: string, body: any) {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, body);
  }

  enviar(id: string) {
    return this.http.post<any>(`${this.baseUrl}/${id}/enviar`, {});
  }

  cancelar(id: string) {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  /** Borra la campaña + sus entregas a clientes. Para campañas ya enviadas. */
  eliminar(id: string) {
    return this.http.delete<any>(`${this.baseUrl}/${id}/hard`);
  }

  /**
   * Clona una campaña como BORRADOR. Devuelve la nueva campaña — el front
   * navega al editor para que el admin la revise antes de enviar.
   */
  duplicar(id: string) {
    return this.http.post<any>(`${this.baseUrl}/${id}/duplicar`, {});
  }
}
