import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api}clientes`;

  create(dto: any) {
    return this.http.post(this.baseUrl, dto);
  }

  findAll(q?: string, estado?: string) {
    let params = new HttpParams();

    if (q) params = params.set('q', q);
    if (estado) params = params.set('estado', estado);

    return this.http.get(this.baseUrl, { params });
  }

  // ✅ NUEVO - listado administrativo con paginación
  listarAdmin(filtros: {
    q?: string;
    estado?: string;
    page?: number;
    limit?: number;
  }) {
    let params = new HttpParams();

    if (filtros.q) {
      params = params.set('q', filtros.q);
    }

    if (filtros.estado !== undefined && filtros.estado !== '') {
      params = params.set('estado', filtros.estado);
    }

    if (typeof filtros.page === 'number') {
      params = params.set('page', filtros.page.toString());
    }

    if (typeof filtros.limit === 'number') {
      params = params.set('limit', filtros.limit.toString());
    }

    return this.http.get<{
      data: any[];
      total: number;
      page: number;
      limit: number;
    }>(`${this.baseUrl}/admin`, { params });
  }

  findById(id: string) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  update(id: string, dto: any) {
    return this.http.put(`${this.baseUrl}/${id}`, dto);
  }

  updateMe(id: string, dto: any) {
    return this.http.put(`${this.baseUrl}/me/${id}`, dto);
  }

  checkEmail(email: string) {
    return this.http.get<{ available: boolean }>(
      `${this.baseUrl}/check-email`,
      { params: { email } },
    );
  }

  resetPassword(email: string, password: string) {
    return this.http.patch(`${this.baseUrl}/reset`, { email, password });
  }
    buscar(q: string): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl, {
      params: { q },
    });
  }
}
