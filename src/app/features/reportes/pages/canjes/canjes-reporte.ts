import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import {
  LineChart,
  BarChart,
  PieChart,
} from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import { ReportesService } from '../../../../services/reportes.service';
import {
  exportCsv,
  exportPdf,
  formatMoney,
  formatNumber,
  hoyISO,
  haceDiasISO,
} from '../../utils/export';

echarts.use([
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
]);

@Component({
  selector: 'app-canjes-reporte',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideAngularModule,
    NgxEchartsDirective,
  ],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './canjes-reporte.html',
})
export class CanjesReporte implements OnInit {
  private svc = inject(ReportesService);

  desde = haceDiasISO(90);
  hasta = hoyISO();
  granularidad: 'dia' | 'semana' | 'mes' = 'dia';

  loading = true;
  canjes: any = null;
  ingresos: any = null;

  serieOption: any = null;
  horasOption: any = null;
  metodosOption: any = null;

  fmtMoney = formatMoney;
  fmtN = formatNumber;

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    Promise.all([
      this.svc
        .canjes({ desde: this.desde, hasta: this.hasta }, this.granularidad)
        .toPromise(),
      this.svc
        .ingresos({ desde: this.desde, hasta: this.hasta })
        .toPromise(),
    ])
      .then(([c, i]) => {
        this.canjes = c;
        this.ingresos = i;
        this.buildCharts();
        this.loading = false;
      })
      .catch(() => {
        this.canjes = null;
        this.ingresos = null;
        this.loading = false;
      });
  }

  private buildCharts() {
    const orange = '#FF9F1C';
    const text = '#CFD8E8';
    const mute = '#A8B5CC';
    const grid = 'rgba(255,255,255,0.08)';

    // Serie temporal canjes
    this.serieOption = {
      tooltip: { trigger: 'axis', backgroundColor: '#0E1B2E', borderColor: '#27406B', textStyle: { color: text } },
      grid: { top: 24, right: 16, bottom: 28, left: 48 },
      xAxis: {
        type: 'category',
        data: (this.canjes?.serie ?? []).map((s: any) => s.fecha),
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
          name: 'Canjes',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: orange, width: 3 },
          itemStyle: { color: orange },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(255,159,28,0.45)' },
                { offset: 1, color: 'rgba(255,159,28,0.00)' },
              ],
            },
          },
          data: (this.canjes?.serie ?? []).map((s: any) => s.canjes),
        },
      ],
    };

    // Canjes por hora
    const horas = Array.from({ length: 24 }, (_, h) => {
      const found = (this.canjes?.porHora ?? []).find((x: any) => x.hora === h);
      return found ? found.canjes : 0;
    });
    this.horasOption = {
      tooltip: { trigger: 'axis', backgroundColor: '#0E1B2E', borderColor: '#27406B', textStyle: { color: text } },
      grid: { top: 16, right: 16, bottom: 28, left: 36 },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 24 }, (_, h) => `${h}h`),
        axisLine: { lineStyle: { color: grid } },
        axisLabel: { color: mute, fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: grid } },
        axisLabel: { color: mute, fontSize: 10 },
      },
      series: [
        {
          type: 'bar',
          data: horas,
          itemStyle: { color: orange, borderRadius: [4, 4, 0, 0] },
        },
      ],
    };

    // Métodos de pago
    const palette = ['#FF9F1C', '#5BA4F0', '#2BD67B', '#FFBF46', '#FF5C73'];
    this.metodosOption = {
      tooltip: { trigger: 'item', backgroundColor: '#0E1B2E', borderColor: '#27406B', textStyle: { color: text } },
      legend: { bottom: 0, textStyle: { color: mute } },
      series: [
        {
          name: 'Método',
          type: 'pie',
          radius: ['55%', '78%'],
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: { borderColor: '#0A1322', borderWidth: 2 },
          data: (this.ingresos?.porMetodo ?? []).map((m: any, i: number) => ({
            name: m.metodo,
            value: m.monto,
            itemStyle: { color: palette[i % palette.length] },
          })),
        },
      ],
    };
  }

  exportarCanjesCsv() {
    const rows = (this.canjes?.serie ?? []).map((s: any) => ({
      fecha: s.fecha,
      canjes: s.canjes,
    }));
    exportCsv('canjes-por-fecha', rows, [
      { key: 'fecha', label: 'Fecha' },
      { key: 'canjes', label: 'Canjes' },
    ]);
  }

  ticketMetodo(m: any): number {
    return (m?.monto || 0) / Math.max(1, m?.ventas || 1);
  }

  exportarTopLocalesCsv() {
    const rows = (this.canjes?.topLocales ?? []).map((l: any) => ({
      nombre: l.nombre,
      email: l.email,
      canjes: l.canjes,
    }));
    exportCsv('top-locales', rows, [
      { key: 'nombre', label: 'Local' },
      { key: 'email', label: 'Email' },
      { key: 'canjes', label: 'Canjes' },
    ]);
  }

  exportarIngresosCsv() {
    const rows = (this.ingresos?.serie ?? []).map((s: any) => ({
      fecha: s.fecha,
      ventas: s.ventas,
      monto: s.monto,
    }));
    exportCsv('ingresos-por-fecha', rows, [
      { key: 'fecha', label: 'Fecha' },
      { key: 'ventas', label: 'Ventas' },
      { key: 'monto', label: 'Monto USD' },
    ]);
  }

  imprimirPdf() {
    exportPdf('canjes-ingresos');
  }
}
