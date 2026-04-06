import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { DashboardService, DashboardResumen } from '../../../../services/dashboard.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule, NgxEchartsDirective],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private dashSvc = inject(DashboardService);

  loading = true;
  error = '';

  // KPIs
  totalEstablecimientos = 0;
  totalClientes = 0;
  totalCupones = 0;
  totalVersiones = 0;

  // Detalle cupones
  cuponesActivos = 0;
  cuponesInactivos = 0;
  cuponesBloqueados = 0;

  // Listas
  establecimientos: any[] = [];
  cuponesRecientes: any[] = [];
  solicitudes: any[] = [];

  // Solicitudes agrupadas
  solicitudesPendientes = 0;
  solicitudesContactadas = 0;
  solicitudesAprobadas = 0;
  solicitudesRechazadas = 0;

  // Charts
  estadoCuponesChart!: EChartsOption;
  actividadChart!: EChartsOption;
  solicitudesChart!: EChartsOption;

  accionesRapidas = [
    { label: 'Crear cupón', icono: 'circle-plus', route: '/cupones/nuevo' },
    { label: 'Cupones', icono: 'ticket', route: '/cupones' },
    { label: 'Establecimientos', icono: 'store', route: '/establecimientos' },
    { label: 'Clientes', icono: 'users', route: '/clientes' },
    { label: 'Catálogos', icono: 'tags', route: '/catalogos' },
    { label: 'Usuarios', icono: 'user-cog', route: '/usuarios' },
  ];

  ngOnInit() {
    this.dashSvc.cargarResumen().subscribe({
      next: (data) => {
        this.mapearDatos(data);
        this.generarGraficos(data);
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los datos del dashboard.';
        this.loading = false;
      },
    });
  }

  private mapearDatos(d: DashboardResumen) {
    this.totalEstablecimientos = d.totalEstablecimientos;
    this.totalClientes = d.totalClientes;
    this.totalCupones = d.totalCupones;
    this.totalVersiones = d.totalVersiones;

    this.cuponesActivos = d.cuponesActivos;
    this.cuponesInactivos = d.cuponesInactivos;
    this.cuponesBloqueados = d.cuponesBloqueados;

    this.establecimientos = d.establecimientos;
    this.cuponesRecientes = d.cuponesRecientes;
    this.solicitudes = d.solicitudes;

    for (const s of d.solicitudes) {
      switch (s.estado) {
        case 'PENDIENTE': this.solicitudesPendientes++; break;
        case 'CONTACTADO': this.solicitudesContactadas++; break;
        case 'APROBADO': this.solicitudesAprobadas++; break;
        case 'RECHAZADO': this.solicitudesRechazadas++; break;
      }
    }
  }

  private generarGraficos(d: DashboardResumen) {
    const accent = '#FF9F1C';
    const primary = '#152A47';
    const accentLight = '#FFBF46';
    const grayMedium = '#7A869A';

    // Pie: Estado de cupones
    this.estadoCuponesChart = {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, textStyle: { color: grayMedium, fontSize: 12 } },
      series: [
        {
          type: 'pie',
          radius: ['48%', '72%'],
          avoidLabelOverlap: true,
          label: { show: false },
          data: [
            { value: d.cuponesActivos, name: 'Activos', itemStyle: { color: accent } },
            { value: d.cuponesInactivos, name: 'Inactivos', itemStyle: { color: primary } },
            { value: d.cuponesBloqueados, name: 'Bloqueados', itemStyle: { color: grayMedium } },
          ],
        },
      ],
    };

    // Line: Actividad de escaneos (14 días)
    const labels = d.escaneosPorDia.map((e) => {
      const parts = e.fecha.split('-');
      return `${parts[2]}/${parts[1]}`;
    });
    const valores = d.escaneosPorDia.map((e) => e.total);

    this.actividadChart = {
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 16, top: 16, bottom: 24 },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { fontSize: 10, color: grayMedium },
        axisLine: { lineStyle: { color: '#E5E7EB' } },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { fontSize: 10, color: grayMedium },
        splitLine: { lineStyle: { color: '#F3F4F6' } },
      },
      series: [
        {
          data: valores,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: accent, width: 2.5 },
          itemStyle: { color: accent },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(255,159,28,0.25)' },
                { offset: 1, color: 'rgba(255,159,28,0.02)' },
              ],
            },
          },
        },
      ],
    };

    // Bar: Solicitudes de empresas
    this.solicitudesChart = {
      tooltip: { trigger: 'axis' },
      grid: { left: 90, right: 16, top: 8, bottom: 8 },
      xAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { fontSize: 10, color: grayMedium },
        splitLine: { lineStyle: { color: '#F3F4F6' } },
      },
      yAxis: {
        type: 'category',
        data: ['Rechazadas', 'Aprobadas', 'Contactadas', 'Pendientes'],
        axisLabel: { fontSize: 11, color: grayMedium },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: 'bar',
          barWidth: 18,
          data: [
            { value: this.solicitudesRechazadas, itemStyle: { color: grayMedium } },
            { value: this.solicitudesAprobadas, itemStyle: { color: '#22C55E' } },
            { value: this.solicitudesContactadas, itemStyle: { color: accentLight } },
            { value: this.solicitudesPendientes, itemStyle: { color: accent } },
          ],
          itemStyle: { borderRadius: [0, 4, 4, 0] },
        },
      ],
    };
  }
}
