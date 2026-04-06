import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsDirective } from 'ngx-echarts';
import { AuthService } from '../../../auth/services/auth';
import { AlertService } from '../../../../core/services/alert.service';
import {
  DashboardLocalService,
  DashboardLocalResumen,
} from '../../../../services/dashboard-local.service';

@Component({
  selector: 'app-dashboard-local',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsDirective],
  templateUrl: './dashboard-local.html',
})
export class DashboardLocal {
  private svc = inject(DashboardLocalService);
  private auth = inject(AuthService);
  private alert = inject(AlertService);

  loading = false;
  fechaInicio = '';
  fechaFin = '';

  // KPIs
  totalCanjes = 0;
  empleadosActivos = 0;
  empleadoTop = '—';
  promedioDiario = 0;

  rankingOptions: any = {};
  tendenciaOptions: any = {};
  distribucionOptions: any = {};
  horasOptions: any = {};

  ngOnInit() {
    // Últimos 14 días por defecto
    const hoy = new Date();
    const hace14 = new Date(hoy);
    hace14.setDate(hace14.getDate() - 14);
    this.fechaInicio = hace14.toISOString().split('T')[0];
    this.fechaFin = hoy.toISOString().split('T')[0];

    this.cargar();
  }

  cargar() {
    const id = this.auth.user?._id;
    if (!id) return;

    this.loading = true;

    this.svc
      .cargarResumen(id, this.fechaInicio, this.fechaFin)
      .subscribe({
        next: (data) => {
          this.aplicarDatos(data);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.alert.error('Error', 'No se pudo cargar el dashboard.');
        },
      });
  }

  filtrar() {
    this.cargar();
  }

  private aplicarDatos(data: DashboardLocalResumen) {
    this.totalCanjes = data.totalCanjes;
    this.empleadosActivos = data.empleadosActivos;
    this.empleadoTop = data.empleadoTop;
    this.promedioDiario = data.promedioDiario;

    // Ranking empleados (bar chart)
    this.rankingOptions = {
      xAxis: {
        type: 'category',
        data: data.rankingEmpleados.map((e) => e.nombre),
      },
      yAxis: { type: 'value' },
      series: [
        {
          data: data.rankingEmpleados.map((e) => e.canjes),
          type: 'bar',
          itemStyle: { borderRadius: 6 },
        },
      ],
    };

    // Tendencia por día (line chart)
    this.tendenciaOptions = {
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: data.canjesPorDia.map((d) => {
          const parts = d.fecha.split('-');
          return `${parts[2]}/${parts[1]}`;
        }),
      },
      yAxis: { type: 'value' },
      series: [
        {
          data: data.canjesPorDia.map((d) => d.total),
          type: 'line',
          smooth: true,
          areaStyle: {},
        },
      ],
    };

    // Distribución por empleado (pie chart)
    this.distribucionOptions = {
      series: [
        {
          type: 'pie',
          radius: ['60%', '80%'],
          data: data.rankingEmpleados.map((e) => ({
            value: e.canjes,
            name: e.nombre,
          })),
        },
      ],
    };

    // Horas pico (bar chart)
    this.horasOptions = {
      xAxis: {
        type: 'category',
        data: data.canjesPorHora.map((h) => h.hora),
      },
      yAxis: { type: 'value' },
      series: [
        {
          data: data.canjesPorHora.map((h) => h.total),
          type: 'bar',
        },
      ],
    };
  }
}
