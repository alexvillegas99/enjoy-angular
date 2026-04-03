import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-inicio-catalogos',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './inicio-catalogos.html',
  styleUrl: './inicio-catalogos.scss',
})
export class InicioCatalogos {
catalogos = [
    {
      titulo: 'Versiones de cuponeras',
      descripcion:
        'Controla las versiones, vigencias y reglas activas de las cuponeras.',
      icono: 'layers',
      color: 'bg-indigo-50 text-indigo-600',
      route: '/catalogos/versiones-cuponera',
    },
    {
      titulo: 'Ciudades',
      descripcion:
        'Administra las ciudades disponibles para clientes y operaciones.',
      icono: 'map-pin',
      color: 'bg-emerald-50 text-emerald-600',
      route: '/catalogos/ciudades',
    },
    {
      titulo: 'Categorías',
      descripcion:
        'Define y organiza las categorías usadas en el sistema.',
      icono: 'tags',
      color: 'bg-amber-50 text-amber-600',
      route: '/catalogos/categorias',
    },
  ];
}
