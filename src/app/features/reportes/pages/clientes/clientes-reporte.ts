import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { PieChart, BarChart } from 'echarts/charts';
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
  PieChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

@Component({
  selector: 'app-clientes-reporte',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideAngularModule,
    NgxEchartsDirective,
  ],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './clientes-reporte.html',
})
export class ClientesReporte implements OnInit {
  private svc = inject(ReportesService);

  desde = haceDiasISO(90);
  hasta = hoyISO();
  loading = true;

  data: any = null;
  recurrentesOption: any = null;
  provinciasOption: any = null;

  fmtN = formatNumber;
  fmtPct = formatPct;

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.svc
      .clientes({ desde: this.desde, hasta: this.hasta })
      .subscribe({
        next: (r) => {
          this.data = r;
          this.buildCharts();
          this.loading = false;
        },
        error: () => {
          this.data = null;
          this.loading = false;
        },
      });
  }

  porcRecurrentes(): number {
    const t = (this.data?.recurrentes || 0) + (this.data?.unicos || 0);
    return t > 0 ? (this.data?.recurrentes || 0) / t : 0;
  }

  private buildCharts() {
    const mute = '#A8B5CC';
    const text = '#CFD8E8';

    // Recurrentes vs únicos
    this.recurrentesOption = {
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
          data: [
            {
              name: 'Recurrentes',
              value: this.data?.recurrentes || 0,
              itemStyle: { color: '#FF9F1C' },
            },
            {
              name: 'Únicos',
              value: this.data?.unicos || 0,
              itemStyle: { color: '#5BA4F0' },
            },
          ],
        },
      ],
    };

    const palette = ['#FF9F1C', '#5BA4F0', '#2BD67B', '#FFBF46', '#FF5C73', '#A07AFF', '#22C2D8'];
    const provincias = this.data?.porProvincia ?? [];
    this.provinciasOption = {
      tooltip: { trigger: 'axis', backgroundColor: '#0E1B2E', borderColor: '#27406B', textStyle: { color: text } },
      grid: { top: 16, right: 16, bottom: 40, left: 100 },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
        axisLabel: { color: mute, fontSize: 11 },
      },
      yAxis: {
        type: 'category',
        data: provincias.map((p: any) => p.provincia),
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        axisLabel: { color: text, fontSize: 11 },
      },
      series: [
        {
          type: 'bar',
          data: provincias.map((p: any, i: number) => ({
            value: p.total,
            itemStyle: { color: palette[i % palette.length], borderRadius: [0, 4, 4, 0] },
          })),
        },
      ],
    };
  }

  exportarTopCsv() {
    const rows = (this.data?.topClientes ?? []).map((c: any) => ({
      nombres: c.nombres,
      apellidos: c.apellidos,
      email: c.email,
      canjes: c.canjes,
    }));
    exportCsv('top-clientes', rows, [
      { key: 'nombres', label: 'Nombres' },
      { key: 'apellidos', label: 'Apellidos' },
      { key: 'email', label: 'Email' },
      { key: 'canjes', label: 'Canjes' },
    ]);
  }

  exportarProvinciasCsv() {
    exportCsv(
      'clientes-por-provincia',
      this.data?.porProvincia ?? [],
      [
        { key: 'provincia', label: 'Provincia' },
        { key: 'total', label: 'Clientes' },
      ],
    );
  }

  imprimirPdf() {
    exportPdf('clientes-retencion');
  }
}
