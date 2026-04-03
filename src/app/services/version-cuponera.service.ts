// src/app/services/version-cuponera.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VersionCuponera {
  _id: string;
  nombre: string;
  estado: boolean;
  numeroDeLocales: number;
  descripcion?: string;
  ciudadesDisponibles: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FiltroVersiones {
  nombre?: string;
  estado?: string;
}

@Injectable({ providedIn: 'root' })
export class VersionCuponeraService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api}versiones`;

  /**
   * Obtener todas las versiones
   */
  obtenerTodas(): Observable<VersionCuponera[]> {
    return this.http.get<VersionCuponera[]>(this.baseUrl);
  }

  /**
   * Buscar versiones por nombre
   */
  buscarPorNombre(
    nombre?: string,
    estado?: string,
  ): Observable<VersionCuponera[]> {
    const params: any = {};
    if (nombre) params.nombre = nombre;
    if (estado !== undefined) params.estado = estado;

    return this.http.get<VersionCuponera[]>(`${this.baseUrl}/buscar/nombre`, {
      params,
    });
  }

  /**
   * Buscar con filtros avanzados
   */
  filtrar(filtros: FiltroVersiones): Observable<VersionCuponera[]> {
    const params: any = {};
    if (filtros.nombre) params.nombre = filtros.nombre;
    if (filtros.estado !== undefined) params.estado = filtros.estado;

    return this.http.get<VersionCuponera[]>(`${this.baseUrl}/buscar/filtros`, {
      params,
    });
  }

  /**
   * Obtener version activas para usar en dropdowns
   */
  obtenerActivas(): Observable<VersionCuponera[]> {
    return this.buscarPorNombre('', 'true');
  }

  /**
   * Obtener versión por ID
   */
  obtenerPorId(id: string): Observable<VersionCuponera> {
    return this.http.get<VersionCuponera>(`${this.baseUrl}/${id}`);
  }

  /**
 * Crear versión de cuponera
 */
crear(data: {
  nombre: string;
  numeroDeLocales: number;
  descripcion?: string;
  ciudadesDisponibles?: string[]; // ids
}): Observable<VersionCuponera> {
  return this.http.post<VersionCuponera>(this.baseUrl, data);
}

/**
 * Actualizar versión
 */
actualizar(
  id: string,
  data: Partial<{
    nombre: string;
    numeroDeLocales: number;
    descripcion?: string;
    ciudadesDisponibles?: string[];
    estado: boolean;
  }>,
): Observable<VersionCuponera> {
  return this.http.patch<VersionCuponera>(`${this.baseUrl}/${id}`, data);
}

/**
 * Eliminar versión
 */
eliminar(id: string): Observable<{ ok: true }> {
  return this.http.delete<{ ok: true }>(`${this.baseUrl}/${id}`);
}

/**
 * Activar versión
 */
activar(id: string): Observable<VersionCuponera> {
  return this.http.patch<VersionCuponera>(
    `${this.baseUrl}/${id}/activar`,
    {},
  );
}

/**
 * Desactivar versión
 */
desactivar(id: string): Observable<VersionCuponera> {
  return this.http.patch<VersionCuponera>(
    `${this.baseUrl}/${id}/desactivar`,
    {},
  );
}

}
