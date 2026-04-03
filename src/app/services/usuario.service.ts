import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api}usuarios`;

  // ===============================
  // ADMIN LISTADO CON FILTROS
  // ===============================
  listarAdmin(params?: {
    q?: string;
    rol?: string;
    estado?: string;
    page?: number;
    limit?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();

    if (params?.q) httpParams = httpParams.set('q', params.q);

    if (params?.rol) httpParams = httpParams.set('rol', params.rol);

    if (params?.estado !== undefined && params.estado !== '')
      httpParams = httpParams.set('estado', params.estado);

    if (params?.page) httpParams = httpParams.set('page', params.page);

    if (params?.limit) httpParams = httpParams.set('limit', params.limit);

    return this.http.get<any>(`${this.baseUrl}/admin-list`, {
      params: httpParams,
    });
  }

  // ===============================
  // OBTENER POR ID
  // ===============================
  obtener(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }
  // ===============================
  // OBTENER POR ID DE LOCAL
  // ===============================
  obtenerPorLocal(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users-local/68b68090af6e4afed306d1b0`);
  }

  // ===============================
  // CREAR USUARIO
  // ===============================
  create(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  // ===============================
  // ACTUALIZAR
  // ===============================
  update(id: string, data: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, data);
  }

  // ===============================
  // ELIMINAR
  // ===============================
  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  buscarPorCorreo(correo: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/buscar/email/${correo}`);
  }

  actualizarContraseniaRecuperacion(email: string, password: string) {
    return this.http.patch(
      `${this.baseUrl}/actualizar/contrasenia/recuperacion`,
      { email, password },
    );
  }
}
