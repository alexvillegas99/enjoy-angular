import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/** Cobros que necesitan una acción del admin (Fase 2 de pagos). */
@Injectable({ providedIn: 'root' })
export class PagosAtencionService {
  private http = inject(HttpClient);
  private pagos = `${environment.api}pagos/admin`;
  private solicitudes = `${environment.api}solicitudes-cuponera`;

  /** Pagos APROBADO sin cupón emitido y pagos en REVISION. */
  porAtender(): Observable<any[]> {
    return this.http.get<any[]>(`${this.pagos}/por-atender`);
  }

  /** Reintenta emitir el cupón de un pago aprobado (idempotente). */
  reemitir(pagoId: string): Observable<{ estado: string }> {
    return this.http.post<{ estado: string }>(`${this.pagos}/${pagoId}/reemitir`, {});
  }

  /** Resuelve un pago en revisión. */
  resolver(pagoId: string, accion: 'aprobar' | 'rechazar', nota?: string): Observable<any> {
    return this.http.post(`${this.pagos}/${pagoId}/resolver`, { accion, nota });
  }

  /** Solicitudes aprobadas cuyo cupón falló al emitirse. */
  solicitudesSinCupon(): Observable<any[]> {
    return this.http.get<any[]>(`${this.solicitudes}/admin/sin-cupon`);
  }

  reintentarSolicitud(id: string): Observable<any> {
    return this.http.post(`${this.solicitudes}/${id}/emitir`, {});
  }
}
