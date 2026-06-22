import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type EstadoFlash = 'ACTIVA' | 'PAUSADA' | 'VENCIDA' | 'ELIMINADA';
export type TipoFlash = 'nuevo_producto' | 'descuento' | 'evento' | 'anuncio';

export interface PromocionFlash {
  _id: string;
  titulo: string;
  descripcion?: string;
  imagenUrl: string;
  tipo: TipoFlash;
  etiqueta?: string | null;
  precio?: number | null;
  precioAntes?: number | null;
  inicia: string;
  vence: string;
  estado: EstadoFlash;
  canjeable: boolean;
  cupos?: number | null;
  limitePorCliente: number;
  vistas: number;
  canjes: number;
}

export interface CreateFlashPayload {
  titulo: string;
  descripcion?: string;
  imagenBase64?: string;
  imagenUrl?: string;
  tipo?: TipoFlash;
  etiqueta?: string;
  precio?: number;
  precioAntes?: number;
  inicia?: string;
  vence?: string;
  canjeable?: boolean;
  cupos?: number | null;
  limitePorCliente?: number;
}

@Injectable({ providedIn: 'root' })
export class PromocionesFlashService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api}promociones-flash`;

  /** Lista las flash del local autenticado. data + activas + max. */
  mias(estado?: EstadoFlash) {
    let p = new HttpParams();
    if (estado) p = p.set('estado', estado);
    return this.http.get<{ data: PromocionFlash[]; activas: number; max: number }>(
      `${this.baseUrl}/mias`,
      { params: p },
    );
  }

  crear(payload: CreateFlashPayload) {
    return this.http.post<PromocionFlash>(this.baseUrl, payload);
  }

  actualizar(id: string, payload: Partial<CreateFlashPayload> & { estado?: EstadoFlash }) {
    return this.http.patch<PromocionFlash>(`${this.baseUrl}/${id}`, payload);
  }

  eliminar(id: string) {
    return this.http.delete<{ ok: boolean }>(`${this.baseUrl}/${id}`);
  }
}
