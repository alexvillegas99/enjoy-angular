import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsDirective } from 'ngx-echarts';

@Component({
  selector: 'app-dashboard-local',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsDirective],
  templateUrl: './dashboard-local.html',
})
export class DashboardLocal {

  fechaInicio = '';
  fechaFin = '';

  // KPIs
  totalCanjes = 420;
  empleadosActivos = 5;
  empleadoTop = 'Carlos M.';
  promedioDiario = 35;

  // 📊 Ranking empleados
  rankingOptions = {
    xAxis: {
      type: 'category',
      data: ['Carlos', 'Ana', 'Luis', 'María', 'Pedro']
    },
    yAxis: { type: 'value' },
    series: [
      {
        data: [120, 95, 80, 70, 55],
        type: 'bar',
        itemStyle: { borderRadius: 6 }
      }
    ]
  };

  // 📈 Tendencia
  tendenciaOptions = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    },
    yAxis: { type: 'value' },
    series: [
      {
        data: [40, 35, 50, 60, 45, 70],
        type: 'line',
        smooth: true,
        areaStyle: {}
      }
    ]
  };

  // 🍩 Distribución por empleado
  distribucionOptions = {
    series: [
      {
        type: 'pie',
        radius: ['60%', '80%'],
        data: [
          { value: 120, name: 'Carlos' },
          { value: 95, name: 'Ana' },
          { value: 80, name: 'Luis' },
          { value: 70, name: 'María' },
          { value: 55, name: 'Pedro' }
        ]
      }
    ]
  };

  // ⏰ Horas pico
  horasOptions = {
    xAxis: {
      type: 'category',
      data: ['10h', '11h', '12h', '13h', '14h', '15h', '16h']
    },
    yAxis: { type: 'value' },
    series: [
      {
        data: [15, 30, 45, 60, 55, 40, 25],
        type: 'bar'
      }
    ]
  };

  filtrar() {
    console.log(this.fechaInicio, this.fechaFin);
  }
}
