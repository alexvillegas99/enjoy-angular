import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CuponService {
  private http = inject(HttpClient);
  private baseUrl = environment.api + 'cupones';

  getCupones(page = 1, limit = 10, search?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get(this.baseUrl, { params });
  }

  /**
   * Crear un nuevo cupón
   */
  crearCupon(dto: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, dto);
  }

  /**
   * Obtener cupones por cliente
   */
  obtenerPorCliente(clienteId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/cliente/${clienteId}`);
  }


}
