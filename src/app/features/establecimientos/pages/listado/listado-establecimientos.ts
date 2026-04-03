import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { EstablecimientosService } from '../../../../services/establecimientos.service';

interface Establecimiento {
  _id: string;
  nombre: string;
  email: string;
  estado: boolean;
  ciudades: string[];
  categorias: string[];
  promedioCalificacion: number;
  detallePromocion?: {
    title?: string;
    imageUrl?: string;
    logoUrl?: string;
  };
}

@Component({
  selector: 'app-listado-establecimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './listado-establecimientos.html',
})
export class ListadoEstablecimientos implements OnInit {
  private srv = inject(EstablecimientosService);
  private router = inject(Router);

  // data
  establecimientos: Establecimiento[] = [];

  // ui state
  cargando = false;
  busqueda = '';

  // pagination
  page = 1;
  limit = 12;
  total = 0;
  pages = 0;

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando = true;

    this.srv
      .listar({
        page: this.page,
        limit: this.limit,
        q: this.busqueda || undefined,
      })
      .subscribe({
        next: (res) => {
          this.establecimientos = res.items;
          this.total = res.total;
          this.pages = res.pages;
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
        },
      });
  }

  buscar() {
    this.page = 1;
    this.cargar();
  }

  siguiente() {
    if (this.page < this.pages) {
      this.page++;
      this.cargar();
    }
  }

  anterior() {
    if (this.page > 1) {
      this.page--;
      this.cargar();
    }
  }

  nuevo() {
    this.router.navigate(['/establecimientos/nuevo']);
  }

  ver(id: string) {
    this.router.navigate(['/establecimientos', id]);
  }

  editar(id: string) {
    this.router.navigate(['/establecimientos', id, 'editar']);
  }
}
