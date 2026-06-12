import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

interface CatalogoCard {
  titulo: string;
  descripcion: string;
  icono: string;
  iconBg: string;
  iconColor: string;
  route: string;
}

@Component({
  selector: 'app-inicio-catalogos',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './inicio-catalogos.html',
  styleUrl: './inicio-catalogos.scss',
})
export class InicioCatalogos {
  catalogos: CatalogoCard[] = [
    {
      titulo: 'Versiones de cuponeras',
      descripcion:
        'Controla las versiones, vigencias y reglas activas de las cuponeras.',
      icono: 'layers',
      iconBg: 'rgba(122, 162, 255, 0.16)',
      iconColor: 'var(--blue)',
      route: '/catalogos/versiones-cuponera',
    },
    {
      titulo: 'Ciudades',
      descripcion:
        'Administra las ciudades disponibles para clientes y operaciones.',
      icono: 'map-pin',
      iconBg: 'rgba(67, 209, 130, 0.16)',
      iconColor: 'var(--green)',
      route: '/catalogos/ciudades',
    },
    {
      titulo: 'Provincias',
      descripcion:
        'Administra las provincias del Ecuador y agrúpalas con sus ciudades.',
      icono: 'map',
      iconBg: 'rgba(0, 200, 220, 0.16)',
      iconColor: '#22D3EE',
      route: '/catalogos/provincias',
    },
    {
      titulo: 'Categorías',
      descripcion:
        'Define y organiza las categorías usadas en el sistema.',
      icono: 'tags',
      iconBg: 'rgba(255, 159, 28, 0.16)',
      iconColor: 'var(--orange)',
      route: '/catalogos/categorias',
    },
  ];
}
