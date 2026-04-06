import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api}roles`;

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  obtener(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  crear(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  actualizar(id: string, data: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, data);
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  /** Obtiene la lista maestra de permisos agrupados por módulo */
  obtenerPermisos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/permisos`);
  }
}
