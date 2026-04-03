import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Categoria {
  _id: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  estado: boolean;
}

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api}categorias`;

  listar(params?: any) {
    return this.http.get<Categoria[]>(this.baseUrl, { params });
  }

  crear(data: Partial<Categoria>) {
    return this.http.post(this.baseUrl, data);
  }

  actualizar(id: string, data: Partial<Categoria>) {
    return this.http.patch(`${this.baseUrl}/${id}`, data);
  }

  activar(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/activar`, {});
  }

  desactivar(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/desactivar`, {});
  }

  eliminar(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
  getActivas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/activas`);
  }
}
