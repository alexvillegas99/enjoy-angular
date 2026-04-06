import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardResumen {
  totalEstablecimientos: number;
  totalClientes: number;
  totalCupones: number;
  totalVersiones: number;
  cuponesActivos: number;
  cuponesInactivos: number;
  cuponesBloqueados: number;
  establecimientos: any[];
  cuponesRecientes: any[];
  versiones: any[];
  solicitudes: any[];
  escaneosPorDia: { fecha: string; total: number }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private api = environment.api;

  cargarResumen(): Observable<DashboardResumen> {
    // Fecha de hace 14 días para el gráfico de actividad
    const hoy = new Date();
    const hace14 = new Date(hoy);
    hace14.setDate(hace14.getDate() - 14);
    const inicio = hace14.toISOString().split('T')[0];
    const fin = hoy.toISOString().split('T')[0];

    return forkJoin({
      establecimientos: this.http.get<any>(`${this.api}usuarios/establecimientos`, {
        params: { page: 1, limit: 10 },
      }),
      clientes: this.http.get<any>(`${this.api}clientes/admin`, {
        params: { page: 1, limit: 1 },
      }),
      cupones: this.http.get<any>(`${this.api}cupones`, {
        params: { page: 1, limit: 20 },
      }),
      versiones: this.http.get<any[]>(`${this.api}versiones`),
      solicitudes: this.http.get<any[]>(`${this.api}empresas/solicitudes`),
      escaneos: this.http.get<any[]>(`${this.api}historico/buscar-por-fechas`, {
        params: { inicio, fin },
      }),
    }).pipe(
      map((res) => {
        // Contar cupones por estado
        const cuponesList = res.cupones?.items || res.cupones?.data || [];
        const totalCupones = res.cupones?.total ?? cuponesList.length;
        let activos = 0, inactivos = 0, bloqueados = 0;
        for (const c of cuponesList) {
          if (c.estado === 'ACTIVO') activos++;
          else if (c.estado === 'INACTIVO') inactivos++;
          else if (c.estado === 'BLOQUEADO') bloqueados++;
        }

        // Agrupar escaneos por día
        const escaneos = res.escaneos || [];
        const porDia = new Map<string, number>();
        for (const e of escaneos) {
          const fecha = new Date(e.fechaEscaneo || e.createdAt).toISOString().split('T')[0];
          porDia.set(fecha, (porDia.get(fecha) || 0) + 1);
        }

        // Generar serie de 14 días
        const escaneosPorDia: { fecha: string; total: number }[] = [];
        for (let d = new Date(hace14); d <= hoy; d.setDate(d.getDate() + 1)) {
          const key = d.toISOString().split('T')[0];
          escaneosPorDia.push({ fecha: key, total: porDia.get(key) || 0 });
        }

        const estabItems = res.establecimientos?.items || [];
        const totalEstab = res.establecimientos?.total ?? estabItems.length;
        const totalClientes = res.clientes?.total ?? 0;

        return {
          totalEstablecimientos: totalEstab,
          totalClientes,
          totalCupones,
          totalVersiones: res.versiones?.length || 0,
          cuponesActivos: activos,
          cuponesInactivos: inactivos,
          cuponesBloqueados: bloqueados,
          establecimientos: estabItems,
          cuponesRecientes: cuponesList.slice(0, 8),
          versiones: res.versiones || [],
          solicitudes: res.solicitudes || [],
          escaneosPorDia,
        };
      }),
    );
  }
}
