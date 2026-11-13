import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ReportesService } from '../../../../services/reportes.service';
import {
  exportCsv,
  exportPdf,
  formatNumber,
  hoyISO,
  haceDiasISO,
} from '../../utils/export';

@Component({
  selector: 'app-ventas-cuponeras-reporte',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './ventas-cuponeras-reporte.html',
})
export class VentasCuponerasReporte implements OnInit {
  private svc = inject(ReportesService);

  desde = haceDiasISO(30);
  hasta = hoyISO();
  granularidad: 'dia' | 'semana' | 'mes' = 'mes';
  loading = true;
  data: any = null;

  fmtN = formatNumber;

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.svc.ventasCuponeras({ desde: this.desde, hasta: this.hasta }, this.granularidad).subscribe({
      next: (r) => {
        this.data = r;
        this.loading = false;
      },
      error: () => {
        this.data = null;
        this.loading = false;
      },
    });
  }

  fmtMoneda(v: number): string {
    if (v == null || isNaN(v)) return '$0.00';
    return '$' + v.toFixed(2);
  }

  exportCsvSerie() {
    if (!this.data?.serie?.length) return;
    exportCsv(
      `ventas-cuponeras-serie-${this.desde}_${this.hasta}`,
      this.data.serie.map((s: any) => ({
        periodo: s.periodo,
        ventas: s.ventas,
        bruto: s.montoBruto.toFixed(2),
        descuento: s.totalDescuento.toFixed(2),
        comision: s.totalComision.toFixed(2),
        neto: s.neto.toFixed(2),
      })),
      [
        { key: 'periodo', label: 'Período' },
        { key: 'ventas', label: 'Ventas' },
        { key: 'bruto', label: 'Bruto USD' },
        { key: 'descuento', label: 'Descuento USD' },
        { key: 'comision', label: 'Comisión USD' },
        { key: 'neto', label: 'Neto USD' },
      ],
    );
  }

  exportCsvCuponeras() {
    if (!this.data?.porCuponera?.length) return;
    exportCsv(
      `ventas-por-cuponera-${this.desde}_${this.hasta}`,
      this.data.porCuponera.map((c: any) => ({
        cuponera: c.nombre,
        ventas: c.ventas,
        bruto: c.montoBruto.toFixed(2),
        descuento: c.totalDescuento.toFixed(2),
        comision: c.totalComision.toFixed(2),
        neto: c.neto.toFixed(2),
      })),
      [
        { key: 'cuponera', label: 'Cuponera' },
        { key: 'ventas', label: 'Ventas' },
        { key: 'bruto', label: 'Bruto USD' },
        { key: 'descuento', label: 'Descuento USD' },
        { key: 'comision', label: 'Comisión USD' },
        { key: 'neto', label: 'Neto USD' },
      ],
    );
  }

  imprimirPdf() {
    exportPdf(`ventas-cuponeras-${this.desde}_${this.hasta}`);
  }
}
