import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-roles',
  imports: [CommonModule, RouterOutlet],
  template: `
    <main class="block">
      <router-outlet />
    </main>
  `,
})
export class Roles {}
