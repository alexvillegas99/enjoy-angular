import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmpresaSolicitudService {
  private http = inject(HttpClient);
  private base = `${environment.api}empresas/solicitudes`;

  /** Lista las solicitudes de acceso de empresas (opcional: filtra por estado). */
  listar(estado?: string): Observable<any> {
    const params: any = {};
    if (estado) params.estado = estado;
    return this.http.get<any[]>(this.base, { params });
  }

  obtener(id: string): Observable<any> {
    return this.http.get(`${this.base}/${id}`);
  }

  /** Actualiza la solicitud (estado y/o nota del admin). */
  actualizar(id: string, data: { estado?: string; notaAdmin?: string }): Observable<any> {
    return this.http.patch(`${this.base}/${id}`, data);
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
