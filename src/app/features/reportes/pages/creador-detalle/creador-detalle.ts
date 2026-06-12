import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import { ReportesService } from '../../../../services/reportes.service';
import {
  exportCsv,
  exportPdf,
  formatNumber,
  hoyISO,
  haceDiasISO,
} from '../../utils/export';

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

@Component({
  selector: 'app-creador-detalle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideAngularModule,
    NgxEchartsDirective,
  ],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './creador-detalle.html',
})
export class CreadorDetalle implements OnInit {
  private svc = inject(ReportesService);
  private route = inject(ActivatedRoute);

  desde = haceDiasISO(90);
  hasta = hoyISO();
  loading = true;

  data: any = null;
  serieOption: any = null;

  fmtN = formatNumber;
  id = '';

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.cargar();
  }

  cargar() {
    if (!this.id) return;
    this.loading = true;
    this.svc.creador(this.id, { desde: this.desde, hasta: this.hasta }).subscribe({
      next: (r) => {
        this.data = r;
        this.buildChart();
        this.loading = false;
      },
      error: () => {
        this.data = null;
        this.loading = false;
      },
    });
  }

  private buildChart() {
    const mute = '#A8B5CC';
    const orange = '#FF9F1C';
    const grid = 'rgba(255,255,255,0.08)';
    const text = '#CFD8E8';
    this.serieOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0E1B2E',
        borderColor: '#27406B',
        textStyle: { color: text },
      },
      grid: { top: 20, right: 16, bottom: 28, left: 40 },
      xAxis: {
        type: 'category',
        data: (this.data?.serie ?? []).map((s: any) => s.fecha),
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
          symbolSize: 5,
          lineStyle: { color: orange, width: 3 },
          itemStyle: { color: orange },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(255,159,28,0.45)' },
                { offset: 1, color: 'rgba(255,159,28,0.00)' },
              ],
            },
          },
          data: (this.data?.serie ?? []).map((s: any) => s.canjes),
        },
      ],
    };
  }

  exportarLocalesCsv() {
    const rows = (this.data?.locales ?? []).map((l: any) => ({
      nombre: l.nombre,
      email: l.email,
      ciudad: l.ciudad,
      categoria: l.categoria,
      estado: l.estado ? 'Activo' : 'Inactivo',
      calificacion: l.calificacion,
      canjes: l.canjes,
    }));
    exportCsv(`locales-${this.data?.creador?.nombre || 'creador'}`, rows, [
      { key: 'nombre', label: 'Local' },
      { key: 'email', label: 'Email' },
      { key: 'ciudad', label: 'Ciudad' },
      { key: 'categoria', label: 'Categoría' },
      { key: 'estado', label: 'Estado' },
      { key: 'calificacion', label: 'Calif.' },
      { key: 'canjes', label: 'Canjes' },
    ]);
  }

  imprimirPdf() {
    exportPdf(`detalle-${this.id}`);
  }
}
