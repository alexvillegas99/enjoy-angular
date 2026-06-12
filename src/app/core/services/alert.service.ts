import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private base = Swal.mixin({
    buttonsStyling: false,
    customClass: {
      popup: 'enjoy-swal-popup',
      title: 'enjoy-swal-title',
      htmlContainer: 'enjoy-swal-html',
      actions: 'enjoy-swal-actions',
      confirmButton: 'enjoy-swal-confirm',
      cancelButton: 'enjoy-swal-cancel',
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
