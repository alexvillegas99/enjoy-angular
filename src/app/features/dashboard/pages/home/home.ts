import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Router, RouterModule } from '@angular/router';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule, NgxEchartsDirective],
  templateUrl: './home.html',
})
export class Home implements OnInit {


  estadoCuponesChart!: EChartsOption;
actividadChart!: EChartsOption;

ngOnInit() {
  this.generarGraficos();
}

generarGraficos() {

  // Gráfico circular estado cupones
  this.estadoCuponesChart = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        name: 'Cupones',
        type: 'pie',
        radius: ['50%', '75%'],
        data: [
          { value: this.resumen.activos, name: 'Activos' },
          { value: this.resumen.vencidos, name: 'Vencidos' },
        ],
      },
    ],
  };

  // Gráfico actividad (demo visual)
  this.actividadChart = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    },
    yAxis: { type: 'value' },
    series: [
      {
        data: [12, 18, 9, 22, 14, 17], // demo
        type: 'line',
        smooth: true,
        areaStyle: {},
      },
    ],
  };
}

  constructor(private readonly router: Router) {}
  resumen = {
    activos: 124,
    vencidos: 32,
    redencionesHoy: 18,
    usuarios: 57,
  };

accionesRapidas = [
  { label: 'Crear cupón', icono: 'circle-plus', route: '/cupones/nuevo' },
  { label: 'Listado cupones', icono: 'ticket', route: '/cupones' },
  { label: 'Categorías', icono: 'tags', route: '/catalogos' },
  { label: 'Reportes', icono: 'chart-column', route: '/reportes' },
  { label: 'Usuarios', icono: 'users', route: '/usuarios' },
  { label: 'Clientes', icono: 'user', route: '/clientes' },
  { label: 'Establecimientos', icono: 'store', route: '/establecimientos' },
];

  cupones = [
    { nombre: '10% Restaurante', vencimiento: '12/02/2026', estado: 'activo' },
    { nombre: '2x1 Cine', vencimiento: '05/02/2026', estado: 'vencido' },
  ];

  estado = {
    lastSync: 'Hace 5 min',
  };

  actividad = [
    'Cupón "2x1 Cine" fue redimido',
    'Nuevo cupón creado: "10% Restaurante"',
    'Usuario admin actualizó categoría',
  ];
}
