import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface ContratoEstado {
  aceptado: boolean;
  contratoUrl: string | null;
  cedulaUrl: string | null;
  contratoVersion: string | null;
  contratoAceptadoEn: string | null;
  datosFaltantes: string[];
  datosLocal: {
    nombreLocal: string;
    ruc: string | null;
    direccion: string | null;
    representanteLegal: string | null;
    cedulaRepresentante: string | null;
    estadoCivilRepresentante: string | null;
    celular: string | null;
  } | null;
}

@Injectable({ providedIn: 'root' })
export class ContratoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api}contratos`;

  /** Cache de la respuesta de mi-estado para evitar pegarle al back N veces
   *  por sesión (guard + página comparten el mismo dato). Se invalida al
   *  aceptar el contrato. */
  private _cache$ = new ReplaySubject<ContratoEstado>(1);
  private _cacheLoaded = false;

  miEstado(force = false): Observable<ContratoEstado> {
    if (this._cacheLoaded && !force) return this._cache$.asObservable();
    return this.http
      .get<ContratoEstado>(`${this.baseUrl}/mi-estado`)
      .pipe(
        tap((r) => {
          this._cache$.next(r);
          this._cacheLoaded = true;
        }),
      );
  }

  aceptar(body: {
    cedulaBase64: string;
    datosLocal: {
      ruc?: string;
      direccion?: string;
      representanteLegal?: string;
      cedulaRepresentante?: string;
      estadoCivilRepresentante?: string;
      celular?: string;
    };
    aceptaTerminos: boolean;
  }) {
    return this.http
      .post<{ contratoUrl: string; cedulaUrl: string }>(
        `${this.baseUrl}/aceptar`,
        body,
      )
      .pipe(
        tap(() => {
          this._cacheLoaded = false; // forzar refetch en próxima
        }),
      );
  }
}
