import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
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
  hoyISO,
  haceDiasISO,
} from '../../utils/export';

echarts.use([BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-locales-reporte',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './locales-reporte.html',
})
export class LocalesReporte implements OnInit {
  private svc = inject(ReportesService);

  desde = haceDiasISO(90);
  hasta = hoyISO();
  loading = true;

  locales: any = null;
  vendedores: any = null;

  provinciasOption: any = null;
  fmtN = formatNumber;

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading = true;
    Promise.all([
      this.svc.locales({ desde: this.desde, hasta: this.hasta }, 25).toPromise(),
      this.svc.vendedores({ desde: this.desde, hasta: this.hasta }).toPromise(),
    ])
      .then(([l, v]) => {
        this.locales = l;
        this.vendedores = v;
        this.buildCharts();
        this.loading = false;
      })
      .catch(() => { this.locales = null; this.vendedores = null; this.loading = false; });
  }

  private buildCharts() {
    const mute = '#A8B5CC';
    const palette = ['#FF9F1C', '#5BA4F0', '#2BD67B', '#FFBF46', '#FF5C73', '#A07AFF'];
    this.provinciasOption = {
      tooltip: { trigger: 'item', backgroundColor: '#0E1B2E', borderColor: '#27406B', textStyle: { color: '#CFD8E8' } },
      legend: { bottom: 0, textStyle: { color: mute, fontSize: 11 } },
      series: [{
        type: 'pie',
        radius: ['55%', '80%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderColor: '#0A1322', borderWidth: 2 },
        data: (this.locales?.porProvincia ?? []).map((p: any, i: number) => ({
          name: p.provincia,
          value: p.total,
          itemStyle: { color: palette[i % palette.length] },
        })),
      }],
    };
  }

  porActivos(): number {
    const t = this.locales?.total || 0;
    return t > 0 ? (this.locales?.activos || 0) / t : 0;
  }

  exportarRankingCsv() {
    const rows = (this.locales?.ranking ?? []).map((l: any) => ({
      nombre: l.nombre, email: l.email, ciudad: l.ciudad, categoria: l.categoria,
      estado: l.estado ? 'Activo' : 'Inactivo',
      calificacion: l.calificacion, canjes: l.canjes,
    }));
    exportCsv('ranking-locales', rows, [
      { key: 'nombre', label: 'Local' },
      { key: 'email', label: 'Email' },
      { key: 'ciudad', label: 'Ciudad' },
      { key: 'categoria', label: 'Categoría' },
      { key: 'estado', label: 'Estado' },
      { key: 'calificacion', label: 'Calificación' },
      { key: 'canjes', label: 'Canjes' },
    ]);
  }

  exportarVendedoresCsv() {
    const rows = (this.vendedores?.vendedores ?? []).map((v: any) => ({
      nombre: v.nombre,
      rol: v.rol || '',
      email: v.email,
      estado: v.estado ? 'Activo' : 'Inactivo',
      localesCreados: v.localesCreados,
      activos: v.activos,
      inactivos: v.inactivos,
      canjesGenerados: v.canjesGenerados,
    }));
    exportCsv('productividad-creadores', rows, [
      { key: 'nombre', label: 'Creador' },
      { key: 'rol', label: 'Rol' },
      { key: 'email', label: 'Email' },
      { key: 'estado', label: 'Estado' },
      { key: 'localesCreados', label: 'Locales creados' },
      { key: 'activos', label: 'Activos' },
      { key: 'inactivos', label: 'Inactivos' },
      { key: 'canjesGenerados', label: 'Canjes generados' },
    ]);
  }

  imprimirPdf() { exportPdf('locales-vendedores'); }
}
