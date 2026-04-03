import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private base = Swal.mixin({
    buttonsStyling: false,
    customClass: {
      popup: 'rounded-lg shadow-lg text-sm',
      title: 'text-lg font-semibold text-gray-800',
      htmlContainer: 'text-gray-600',

      actions: 'flex gap-3 justify-center mt-6',

      confirmButton: 'bg-primary text-white px-4 py-2 rounded hover:opacity-95',
      cancelButton:
        'bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200',
    },
  });

  /** Confirmación genérica */
  confirm(options: {
    title: string;
    text?: string;
    confirmText?: string;
    cancelText?: string;
    icon?: SweetAlertIcon;
  }): Promise<boolean> {
    return this.base
      .fire({
        title: options.title,
        text: options.text,
        icon: options.icon ?? 'warning',
        showCancelButton: true,
        confirmButtonText: options.confirmText ?? 'Confirmar',
        cancelButtonText: options.cancelText ?? 'Cancelar',
        reverseButtons: true,
      })
      .then((r) => r.isConfirmed);
  }

  /** Confirmación de salida (perder avance) */
  confirmExit(): Promise<boolean> {
    return this.confirm({
      title: '¿Cancelar proceso?',
      text: 'Si sales ahora, se perderá todo el avance realizado.',
      confirmText: 'Sí, salir',
      cancelText: 'Continuar',
      icon: 'warning',
    });
  }

  /** Éxito */
  success(title: string, text?: string) {
    return this.base.fire({
      icon: 'success',
      title,
      text,
      confirmButtonText: 'Aceptar',
    });
  }

  /** Error */
  error(title: string, text?: string) {
    return this.base.fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'Entendido',
    });
  }

  /** Advertencia */
  warning(title: string, text?: string) {
    return this.base.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonText: 'Aceptar',
    });
  }

  /** Info */
  info(title: string, text?: string) {
    return this.base.fire({
      icon: 'info',
      title,
      text,
      confirmButtonText: 'Aceptar',
    });
  }
}
