import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pantalla-espera',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pantalla-espera.html',
})
export class PantallaEspera implements OnInit {
  titulo = '';
  subtitulo = '';
  redireccionFinal = '/home';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.titulo = data['titulo'];
      this.subtitulo = data['subtitulo'];
      this.redireccionFinal = data['redireccionFinal'] ?? '/dashboard';
    });

    setTimeout(() => {
      this.router.navigateByUrl(this.redireccionFinal);
    }, 2000);
  }
}
