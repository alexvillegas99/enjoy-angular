import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  PromotorService,
  ReportePromotores,
} from '../../../../services/promotor.service';
import {
  exportCsv,
  exportPdf,
  formatNumber,
  hoyISO,
  haceDiasISO,
} from '../../utils/export';

@Component({
  selector: 'app-promotores-reporte',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './promotores-reporte.html',
})
export class PromotoresReporte implements OnInit {
  private svc = inject(PromotorService);

  desde = haceDiasISO(30);
  hasta = hoyISO();
  loading = true;
  data: ReportePromotores | null = null;

  fmtN = formatNumber;

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.svc.reporte({ desde: this.desde, hasta: this.hasta }).subscribe({
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

  exportCsv() {
    if (!this.data) return;
    exportCsv(
      `promotores-${this.desde}_${this.hasta}`,
      this.data.promotores.map((p) => ({
        nombre: p.nombre,
        email: p.email,
        codigo: p.codigo,
        ventas: p.ventas,
        montoBruto: p.montoBruto.toFixed(2),
        descuento: p.totalDescuento.toFixed(2),
        comision: p.totalComision.toFixed(2),
        comisionAcreditada: p.comisionAcreditada.toFixed(2),
        saldoActual: p.saldoActual.toFixed(2),
      })),
      [
        { key: 'nombre', label: 'Promotor' },
        { key: 'email', label: 'Email' },
        { key: 'codigo', label: 'Código' },
        { key: 'ventas', label: 'Ventas' },
        { key: 'montoBruto', label: 'Monto bruto USD' },
        { key: 'descuento', label: 'Descuento dado USD' },
        { key: 'comision', label: 'Comisión USD' },
        { key: 'comisionAcreditada', label: 'Comisión acreditada' },
        { key: 'saldoActual', label: 'Saldo actual' },
      ],
    );
  }

  imprimirPdf() {
    exportPdf(`promotores-${this.desde}_${this.hasta}`);
  }
}
