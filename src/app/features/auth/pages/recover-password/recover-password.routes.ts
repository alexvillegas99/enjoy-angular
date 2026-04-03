import { Routes } from '@angular/router';
import { RecoverPassword } from './recover-password';
import { CedulaDactilar } from '../../../../shared/components/auth-components/cedula-dactilar/cedula-dactilar';
import { NuevaContrasena } from '../../../../shared/components/auth-components/nueva-contrasena/nueva-contrasena';
import { ProcesoFinal } from '../../../../shared/components/auth-components/proceso-final/proceso-final';
import { ValidacionOtp } from '../../../../shared/components/auth-components/validacion-otp/validacion-otp';

const base = 'auth/recover-password/';

export const recoverPasswordRoutes: Routes = [
  {
    path: '',
    component: RecoverPassword,
    children: [
      {
        path: 'identidad',
        component: CedulaDactilar,
        data: {
          titulo: 'Recuperación de contraseña',
          subtitulo:
            'Ingresa tu correo asociado a Enjoy para continuar con el proceso.',
          labelCorreo: 'Correo electrónico',
          boton: 'Continuar',
          siguiente: `${base}/otp`,
          info: 'Por tu seguridad, el proceso de recuperación puede incluir validaciones adicionales.',
        },
      },
      {
        path: 'otp',
        component: ValidacionOtp,
        data: {
          titulo: 'Recuperación de contraseña',
          subtitulo: 'Verificación de seguridad',
          mensaje:
            'Hemos enviado un código de verificación a tu correo electrónico registrado.',
          siguiente: `${base}/nueva-contrasena`,
        },
      },
      {
        path: 'nueva-contrasena',
        component: NuevaContrasena,
        data: {
          titulo: 'Recuperación de contraseña',
          subtitulo: 'Establece una nueva contraseña para tu cuenta Enjoy.',
          siguiente: `${base}/final`,
        },
      },
      {
        path: 'final',
        component: ProcesoFinal,
        data: {
          titulo: 'Contraseña actualizada',
          subtitulo: 'Proceso completado',
          mensaje: 'Tu contraseña fue cambiada correctamente.',
          detalle: 'Ya puedes iniciar sesión con tu nueva contraseña.',
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
