import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import { ReportesService } from '../../../../services/reportes.service';
import {
  exportCsv,
  exportPdf,
  formatNumber,
  formatPct,
  hoyISO,
  haceDiasISO,
} from '../../utils/export';

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

@Component({
  selector: 'app-flash-reporte',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideAngularModule,
    NgxEchartsDirective,
  ],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './flash-reporte.html',
})
export class FlashReporte implements OnInit {
  private svc = inject(ReportesService);

  desde = haceDiasISO(90);
  hasta = hoyISO();
  loading = true;

  flash: any = null;
  solicitudes: any = null;

  estadoOption: any = null;
  embudoOption: any = null;
  serieSolicitudesOption: any = null;

  fmtN = formatNumber;
  fmtPct = formatPct;

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    Promise.all([
      this.svc.flash({ desde: this.desde, hasta: this.hasta }).toPromise(),
      this.svc
        .solicitudes({ desde: this.desde, hasta: this.hasta })
        .toPromise(),
    ])
      .then(([f, s]) => {
        this.flash = f;
        this.solicitudes = s;
        this.buildCharts();
        this.loading = false;
      })
      .catch(() => {
        this.flash = null;
        this.solicitudes = null;
        this.loading = false;
      });
  }

  private buildCharts() {
    const mute = '#A8B5CC';
    const text = '#CFD8E8';
    const grid = 'rgba(255,255,255,0.08)';
    const palette: Record<string, string> = {
      ACTIVA: '#2BD67B',
      PAUSADA: '#FFBF46',
      VENCIDA: '#5BA4F0',
      ELIMINADA: '#FF5C73',
      PENDIENTE: '#FFBF46',
      APROBADA: '#2BD67B',
      CONFIRMADA: '#2BD67B',
      PAGADA: '#2BD67B',
      RECHAZADA: '#FF5C73',
    };

    // Flash por estado
    this.estadoOption = {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#0E1B2E',
        borderColor: '#27406B',
        textStyle: { color: text },
      },
      legend: { bottom: 0, textStyle: { color: mute } },
      series: [
        {
          type: 'pie',
          radius: ['55%', '78%'],
          label: { show: false },
          labelLine: { show: false },
          itemStyle: { borderColor: '#0A1322', borderWidth: 2 },
          data: (this.flash?.porEstado ?? []).map((e: any) => ({
            name: e.estado,
            value: e.total,
            itemStyle: { color: palette[e.estado] || '#FF9F1C' },
          })),
        },
      ],
    };

    // Embudo solicitudes (bar horizontal)
    const porEstado = this.solicitudes?.porEstado ?? [];
    this.embudoOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0E1B2E',
        borderColor: '#27406B',
        textStyle: { color: text },
      },
      grid: { top: 16, right: 16, bottom: 28, left: 110 },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: grid } },
        axisLabel: { color: mute, fontSize: 11 },
      },
      yAxis: {
        type: 'category',
        data: porEstado.map((p: any) => p.estado),
        axisLabel: { color: text, fontSize: 11 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      },
      series: [
        {
          type: 'bar',
          data: porEstado.map((p: any) => ({
            value: p.total,
            itemStyle: {
              color: palette[p.estado] || '#FF9F1C',
              borderRadius: [0, 6, 6, 0],
            },
          })),
        },
      ],
    };

    // Serie diaria solicitudes
    this.serieSolicitudesOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0E1B2E',
        borderColor: '#27406B',
        textStyle: { color: text },
      },
      grid: { top: 24, right: 16, bottom: 28, left: 40 },
      xAxis: {
        type: 'category',
        data: (this.solicitudes?.serie ?? []).map((s: any) => s.fecha),
        axisLine: { lineStyle: { color: grid } },
        axisLabel: { color: mute, fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: grid } },
        axisLabel: { color: mute, fontSize: 11 },
      },
      series: [
        {
          type: 'line',
          smooth: true,
          symbolSize: 6,
          lineStyle: { color: '#5BA4F0', width: 3 },
          itemStyle: { color: '#5BA4F0' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(91,164,240,0.45)' },
                { offset: 1, color: 'rgba(91,164,240,0.00)' },
              ],
            },
          },
          data: (this.solicitudes?.serie ?? []).map((s: any) => s.total),
        },
      ],
    };
  }

  exportarFlashCsv() {
    const rows = (this.flash?.topFlash ?? []).map((f: any) => ({
      titulo: f.titulo,
      local: f.local,
      tipo: f.tipo,
      estado: f.estado,
      canjeable: f.canjeable ? 'Sí' : 'No',
      vistas: f.vistas,
      canjes: f.canjes,
    }));
    exportCsv('top-promos-flash', rows, [
      { key: 'titulo', label: 'Título' },
      { key: 'local', label: 'Local' },
      { key: 'tipo', label: 'Tipo' },
      { key: 'estado', label: 'Estado' },
      { key: 'canjeable', label: 'Canjeable' },
      { key: 'vistas', label: 'Vistas' },
      { key: 'canjes', label: 'Canjes' },
    ]);
  }

  exportarSolicitudesCsv() {
    exportCsv(
      'solicitudes-por-estado',
      this.solicitudes?.porEstado ?? [],
      [
        { key: 'estado', label: 'Estado' },
        { key: 'total', label: 'Total' },
      ],
    );
  }

  imprimirPdf() {
    exportPdf('flash-solicitudes');
  }
}
