import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardHeader } from '../dashboard-header/dashboard-header';
import { DashboardSidebar } from '../dashboard-sidebar/dashboard-sidebar';
import { DashboardBottomNav } from '../dashboard-bottom-nav/dashboard-bottom-nav';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    DashboardHeader,
    DashboardSidebar,
    DashboardBottomNav,
  ],
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayout {}
