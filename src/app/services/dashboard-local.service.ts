import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardLocalResumen {
  totalCanjes: number;
  empleadosActivos: number;
  totalEmpleados: number;
  empleadoTop: string;
  promedioDiario: number;
  empleados: any[];
  escaneos: any[];
  rankingEmpleados: { nombre: string; canjes: number }[];
  canjesPorDia: { fecha: string; total: number }[];
  canjesPorHora: { hora: string; total: number }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardLocalService {
  private http = inject(HttpClient);
  private api = environment.api;

  cargarResumen(
    usuarioId: string,
    fechaInicio?: string,
    fechaFin?: string,
  ): Observable<DashboardLocalResumen> {
    const hoy = new Date();
    const hace14 = new Date(hoy);
    hace14.setDate(hace14.getDate() - 14);

    const inicio = fechaInicio || hace14.toISOString().split('T')[0];
    const fin = fechaFin || hoy.toISOString().split('T')[0];

    return forkJoin({
      empleados: this.http.get<any>(
        `${this.api}usuarios/users-local/${usuarioId}`,
      ),
      escaneos: this.http.post<any[]>(
        `${this.api}historico/usuario/fechas/dashboard`,
        { id: usuarioId, fechaInicio: inicio, fechaFin: fin },
      ),
    }).pipe(
      map((res) => {
        const empleados: any[] = Array.isArray(res.empleados)
          ? res.empleados
          : res.empleados?.data ?? [];
        const escaneos: any[] = res.escaneos ?? [];

        // KPIs
        const totalCanjes = escaneos.length;
        const empleadosActivos = empleados.filter((e: any) => e.estado).length;

        // Calcular días en el rango para promedio
        const dInicio = new Date(inicio);
        const dFin = new Date(fin);
        const dias = Math.max(
          1,
          Math.ceil(
            (dFin.getTime() - dInicio.getTime()) / (1000 * 60 * 60 * 24),
          ) + 1,
        );
        const promedioDiario =
          totalCanjes > 0 ? Math.round(totalCanjes / dias) : 0;

        // Ranking por empleado (usuario que escaneó)
        const conteoEmpleados = new Map<string, number>();
        for (const e of escaneos) {
          const nombre =
            e.usuario?.nombre ?? e.usuarioNombre ?? 'Sin nombre';
          conteoEmpleados.set(
            nombre,
            (conteoEmpleados.get(nombre) || 0) + 1,
          );
        }

        const rankingEmpleados = Array.from(conteoEmpleados.entries())
          .map(([nombre, canjes]) => ({ nombre, canjes }))
          .sort((a, b) => b.canjes - a.canjes);

        const empleadoTop =
          rankingEmpleados.length > 0 ? rankingEmpleados[0].nombre : '—';

        // Canjes por día
        const porDia = new Map<string, number>();
        for (const e of escaneos) {
          const fecha = new Date(e.fechaEscaneo || e.createdAt)
            .toISOString()
            .split('T')[0];
          porDia.set(fecha, (porDia.get(fecha) || 0) + 1);
        }

        const canjesPorDia: { fecha: string; total: number }[] = [];
        for (
          const d = new Date(dInicio);
          d <= dFin;
          d.setDate(d.getDate() + 1)
        ) {
          const key = d.toISOString().split('T')[0];
          canjesPorDia.push({ fecha: key, total: porDia.get(key) || 0 });
        }

        // Canjes por hora
        const porHora = new Map<number, number>();
        for (const e of escaneos) {
          const hora = new Date(e.fechaEscaneo || e.createdAt).getHours();
          porHora.set(hora, (porHora.get(hora) || 0) + 1);
        }

        const canjesPorHora: { hora: string; total: number }[] = [];
        for (let h = 6; h <= 22; h++) {
          canjesPorHora.push({
            hora: `${h}h`,
            total: porHora.get(h) || 0,
          });
        }

        return {
          totalCanjes,
          empleadosActivos,
          totalEmpleados: empleados.length,
          empleadoTop,
          promedioDiario,
          empleados,
          escaneos,
          rankingEmpleados,
          canjesPorDia,
          canjesPorHora,
        };
      }),
    );
  }
}
