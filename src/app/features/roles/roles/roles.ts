import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-roles',
  imports: [CommonModule, RouterOutlet],
  template: `
    <main class="flex-1 overflow-auto px-6 py-6 bg-slate-50">
      <router-outlet />
    </main>
  `,
})
export class Roles {}
