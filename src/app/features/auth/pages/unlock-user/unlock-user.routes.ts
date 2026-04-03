import { Routes } from '@angular/router';
import { UnlockUser } from './unlock-user';
import { CedulaDactilar } from '../../../../shared/components/auth-components/cedula-dactilar/cedula-dactilar';
import { ValidacionOtp } from '../../../../shared/components/auth-components/validacion-otp/validacion-otp';
import { ProcesoFinal } from '../../../../shared/components/auth-components/proceso-final/proceso-final';

const base = 'auth/unlock-user/';

export const unlockUserRoutes: Routes = [
  {
    path: '',
    component: UnlockUser,
    children: [
      {
        path: 'identidad',
        component: CedulaDactilar,
        data: {
          titulo: 'Desbloqueo de usuario',
          subtitulo: '   Ingresa tu cédula y código dactilar para continuar con el proceso de desbloqueo de usuario.',
          labelDocumento: 'Cédula',
          labelDactilar: 'Código dactilar',
          boton: 'Continuar',
          siguiente: `${base}/otp`,
          info: 'Por tu seguridad, necesitamos validar tu identidad antes de desbloquear el usuario.',
        },
      },
      {
        path: 'otp',
        component: ValidacionOtp,
        data: {
          titulo: 'Desbloqueo de usuario',
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
          titulo: 'Usuario desbloqueado',
          subtitulo: 'Proceso completado',
          mensaje: 'Tu usuario fue desbloqueado correctamente.',
          detalle: 'Ya puedes iniciar sesión nuevamente.',
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
