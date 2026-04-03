// app/establecimientos/establecimiento-detalle/establecimiento-detalle.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EstablecimientosService } from '../../../../services/establecimientos.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-establecimiento-detalle',
  standalone: true,
  imports: [CommonModule,LucideAngularModule],
  templateUrl: './detalle-establecimiento.html',
})
export class DetalleEstablecimiento implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(EstablecimientosService);

  establecimiento?: any;
  loading = true;
  error = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getDetalle(id).subscribe({
      next: (data) => {
        this.establecimiento = data;
        this.loading = false;
        console.log(this.establecimiento)
      },
      error: () => {
        this.error = 'No se pudo cargar el establecimiento';
        this.loading = false;
      },
    });
  }
}
