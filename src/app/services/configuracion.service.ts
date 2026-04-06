import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Configuracion {
  _id: string;
  clave: string;
  valor: string;
  descripcion: string;
}

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private http = inject(HttpClient);
  private base = `${environment.api}configuracion`;

  listar(): Observable<Configuracion[]> {
    return this.http.get<Configuracion[]>(this.base);
  }

  obtener(clave: string): Observable<Configuracion> {
    return this.http.get<Configuracion>(`${this.base}/${clave}`);
  }

  actualizar(clave: string, data: { valor: string; descripcion?: string }): Observable<Configuracion> {
    return this.http.patch<Configuracion>(`${this.base}/${clave}`, data);
  }
}
