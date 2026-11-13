import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-inicio-reportes',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './inicio-reportes.html',
})
export class InicioReportes {
  reportes = [
    {
      slug: 'canjes',
      icono: 'trending-up',
      titulo: 'Canjes & Ingresos',
      bajada:
        'Cupones canjeados por período, ingresos por membresías, métodos de pago.',
      kpis: ['Total canjes', 'Ingreso total', 'Top horarios'],
    },
    {
      slug: 'ventas-cuponeras',
      icono: 'ticket',
      titulo: 'Ventas de cuponeras',
      bajada:
        'Cuponeras vendidas por mes (solicitudes aprobadas) con neto al negocio, restando descuentos y comisiones de promotores.',
      kpis: ['Ventas/mes', 'Neto', 'Por cuponera'],
    },
    {
      slug: 'locales',
      icono: 'store',
      titulo: 'Locales & Vendedores',
      bajada:
        'Ranking de locales activos + productividad por vendedor (creados, activos, canjes).',
      kpis: ['Ranking', 'Por provincia', 'Vendedores'],
    },
    {
      slug: 'clientes',
      icono: 'users',
      titulo: 'Clientes & Retención',
      bajada:
        'Nuevos vs recurrentes, top consumidores, distribución geográfica.',
      kpis: ['Recurrentes', 'Top consumo', 'Por provincia'],
    },
    {
      slug: 'flash',
      icono: 'bolt',
      titulo: 'Flash & Solicitudes',
      bajada:
        'Rendimiento de promos flash y embudo de solicitudes con tiempo de aprobación.',
      kpis: ['Conversión flash', 'Embudo', 'Tiempo aprob.'],
    },
    {
      slug: 'promotores',
      icono: 'user-check',
      titulo: 'Programa de promotores',
      bajada:
        'Ventas por código de promotor: cantidad de canjes, descuentos otorgados, comisiones generadas y saldo actual.',
      kpis: ['Ventas por código', 'Comisión', 'Saldo'],
    },
  ];
}
