import { Routes } from '@angular/router';
import { CedulaDactilar } from '../../../../shared/components/auth-components/cedula-dactilar/cedula-dactilar';
import { ValidacionOtp } from '../../../../shared/components/auth-components/validacion-otp/validacion-otp';
import { ProcesoFinal } from '../../../../shared/components/auth-components/proceso-final/proceso-final';
import { RecoverUser } from './recover-user';

const base = 'auth/recover-user/';

export const recoverUserRoutes: Routes = [
  {
    path: '',
    component: RecoverUser,
    children: [
      {
        path: 'identidad',
        component: CedulaDactilar,
        data: {
          titulo: 'Recuperación de usuario',
          subtitulo:
            'Ingresa tu cédula y código dactilar para recuperar tu usuario.',
          labelDocumento: 'Cédula',
          labelDactilar: 'Código dactilar',
          boton: 'Continuar',
          siguiente: `${base}/otp`,
          info:
            'Por tu seguridad, validaremos tu identidad antes de continuar.',
        },
      },
      {
        path: 'otp',
        component: ValidacionOtp,
        data: {
          titulo: 'Recuperación de usuario',
          subtitulo: 'Verificación de seguridad',
          mensaje:
            'Hemos enviado un código de verificación a tu teléfono registrado.',
          siguiente: `${base}/final`,
        },
      },
      {
        path: 'final',
        component: ProcesoFinal,
        data: {
          titulo: 'Usuario recuperado',
          subtitulo: 'Proceso completado',
          mensaje:
            'Tu usuario fue recuperado exitosamente.',
          detalle:
            'Hemos enviado tu usuario al correo electrónico registrado.',
          icono: 'check-icon',
          estado: 'success',
          boton: 'Iniciar sesión',
        },
      },
      {
        path: '',
        redirectTo: 'identidad',
        pathMatch: 'full',
      },
    ],
  },
];
