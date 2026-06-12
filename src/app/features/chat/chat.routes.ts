import { Routes } from '@angular/router';

export const chatRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/chat-page/chat-page').then((m) => m.ChatPage),
    data: { titulo: 'Soporte', subtitulo: 'Conversaciones con los locales' },
  },
  {
    path: 'config',
    loadComponent: () =>
      import('./pages/config-soporte/config-soporte').then(
        (m) => m.ConfigSoporte,
      ),
    data: { titulo: 'Equipo de Soporte' },
  },
];
