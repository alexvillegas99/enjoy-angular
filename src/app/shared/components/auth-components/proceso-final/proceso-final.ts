import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-proceso-final',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './proceso-final.html',
})
export class ProcesoFinal {
  institution = environment.institution;

  data: any;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.data = this.route.snapshot.data;
  }

  continuar() {
    this.router.navigate(['/auth/login']);
  }
}
