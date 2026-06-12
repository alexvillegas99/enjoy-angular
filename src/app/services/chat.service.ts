import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api}chat`;

  listarHilos(opts: {
    q?: string;
    estado?: 'ABIERTA' | 'CERRADA';
    asignadoMi?: boolean;
    page?: number;
    limit?: number;
  } = {}) {
    let params = new HttpParams();
    if (opts.q) params = params.set('q', opts.q);
    if (opts.estado) params = params.set('estado', opts.estado);
    if (opts.asignadoMi) params = params.set('asignadoMi', 'true');
    if (opts.page) params = params.set('page', opts.page);
    if (opts.limit) params = params.set('limit', opts.limit);
    return this.http.get<any>(`${this.baseUrl}/hilos`, { params });
  }

  miHilo() {
    return this.http.get<any>(`${this.baseUrl}/mi-hilo`);
  }

  obtenerHilo(id: string) {
    return this.http.get<any>(`${this.baseUrl}/hilos/${id}`);
  }

  noLeidos() {
    return this.http.get<{ total: number }>(`${this.baseUrl}/no-leidos`);
  }

  mensajes(id: string, cursor?: string | null, limit = 30) {
    let params = new HttpParams().set('limit', limit);
    if (cursor) params = params.set('cursor', cursor);
    return this.http.get<any>(`${this.baseUrl}/hilos/${id}/mensajes`, {
      params,
    });
  }

  enviar(id: string, body: { texto?: string; imagenBase64?: string }) {
    return this.http.post<any>(`${this.baseUrl}/hilos/${id}/mensajes`, body);
  }

  marcarLeidos(id: string) {
    return this.http.post<any>(`${this.baseUrl}/hilos/${id}/leer`, {});
  }

  asignar(id: string, agenteId?: string) {
    return this.http.patch<any>(`${this.baseUrl}/hilos/${id}/asignar`, {
      agenteId,
    });
  }

  cerrar(id: string) {
    return this.http.patch<any>(`${this.baseUrl}/hilos/${id}/cerrar`, {});
  }

  reabrir(id: string) {
    return this.http.patch<any>(`${this.baseUrl}/hilos/${id}/reabrir`, {});
  }

  // ── Routing / asignación / transferencia ──
  getRoutingConfig() {
    return this.http.get<any>(`${this.baseUrl}/config/routing`);
  }
  updateRoutingConfig(body: {
    habilitado?: boolean;
    escalacionMin?: number;
    pool?: { userId: string; nombre: string }[];
  }) {
    return this.http.patch<any>(`${this.baseUrl}/config/routing`, body);
  }
  listarAgentes() {
    return this.http.get<any[]>(`${this.baseUrl}/agentes`);
  }
  transferir(hiloId: string, paraUserId: string, observacion: string) {
    return this.http.post<any>(`${this.baseUrl}/hilos/${hiloId}/transferir`, {
      paraUserId,
      observacion,
    });
  }

  // Presencia multi-agente
  atender(id: string) {
    return this.http.post<any>(`${this.baseUrl}/hilos/${id}/atender`, {});
  }

  heartbeat(id: string) {
    return this.http.post<any>(`${this.baseUrl}/hilos/${id}/heartbeat`, {});
  }

  liberar(id: string) {
    return this.http.post<any>(`${this.baseUrl}/hilos/${id}/liberar`, {});
  }
}
