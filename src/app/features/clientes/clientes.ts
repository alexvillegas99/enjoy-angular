import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [RouterOutlet],
  template: `<div class="h-full">
    <router-outlet></router-outlet>
  </div>`,
})
export class Clientes {}
