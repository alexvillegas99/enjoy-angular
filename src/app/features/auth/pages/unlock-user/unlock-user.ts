import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-unlock-user',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class UnlockUser {}
