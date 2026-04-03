import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { LUCIDE_ICONS } from './core/icons/lucide-icons';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { NgApexchartsModule } from 'ng-apexcharts';
import * as echarts from 'echarts';
import { provideEchartsCore } from 'ngx-echarts';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(LUCIDE_ICONS),
    importProvidersFrom(NgApexchartsModule),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideEchartsCore({ echarts }),
  ],
};
