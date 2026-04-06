import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SolicitudCuponeraService {
  private http = inject(HttpClient);
  private base = `${environment.api}solicitudes-cuponera`;

  listar(params?: { estado?: string; page?: number; limit?: number }): Observable<any> {
    return this.http.get(this.base, { params: params as any });
  }

  obtener(id: string): Observable<any> {
    return this.http.get(`${this.base}/${id}`);
  }

  actualizarEstado(id: string, data: { estado: string; notaAdmin?: string }): Observable<any> {
    return this.http.patch(`${this.base}/${id}/estado`, data);
  }
}
