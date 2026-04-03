import { Routes } from '@angular/router';
import { LoginFlow } from './login-flow';

import { ValidacionOtp } from '../../../../shared/components/auth-components/validacion-otp/validacion-otp';
import { PantallaEspera } from '../../../../shared/components/auth-components/pantalla-espera/pantalla-espera';
import { Login } from './login';

const base = 'auth/';

export const loginRoutes: Routes = [
  {
    path: '',
    component: LoginFlow,
    children: [
      {
        path: 'login',
        component: Login,
        data: {
          titulo: 'Inicio de sesión',
          subtitulo: 'Ingresa tus credenciales para continuar',
          boton: 'Continuar',
          siguiente: `${base}espera`,
        },
      },

 /*      {
        path: 'otp',
        component: ValidacionOtp,
        data: {
          titulo: 'Verificación de seguridad',
          subtitulo: 'Código de verificación',
          mensaje:
            'Hemos enviado un código de verificación a tu teléfono registrado.',
          siguiente: `${base}espera`,
          anterior: `${base}login`,
        },
      },
 */
      {
        path: 'espera',
        component: PantallaEspera,
        data: {
          titulo: 'Validando información',
          subtitulo: 'Por favor espera unos segundos',
          redireccionFinal: '/dashboard', // o /dashboard
        },
      },

      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];
