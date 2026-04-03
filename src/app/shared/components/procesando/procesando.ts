import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { SecureStorageService } from '../../../core/services/secure-storage.service';
import { LocalStorageKeys } from '../../../core/constants/localstorage';

@Component({
  standalone: true,
  selector: 'app-procesando',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './procesando.html',
})
export class Procesando implements OnInit {
  estado: 'loading' | 'success' = 'loading';
  titulo = 'Procesando';
  mensaje = 'Estamos registrando la información';
  detalle = 'No cierres esta pantalla';
  siguiente: any;
  signal: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storage: SecureStorageService,
  ) {}

  ngOnInit(): void {
    const data = this.route.snapshot.data;
    this.titulo = data['titulo'] ?? this.titulo;
    this.siguiente = data['siguiente'];
    console.log('Proceso actual :', data['proceso']);
    switch (data['proceso']) {
      case 'registro-destinatario':
        this.registrarDestinatario();
        break;
      case 'transferencia':
        this.realizarTransferencia();
        break;
        case 'pago-servicios':
          this.realizarPagoServicio();
          break;
      default:
        break;
    }
    /*  */
  }

  realizarPagoServicio(){
    this.mensaje = 'Estamos realizando el pago del servicio';
    this.detalle = 'Puedes continuar con el siguiente paso';
    setTimeout(() => {
      this.continuar();
    }, 3000);
  }
  realizarTransferencia() {
    this.mensaje = 'La operación se procesó correctamente';
    this.detalle = 'Puedes continuar con el siguiente paso';
    setTimeout(() => {
      this.continuar();
    }, 3000);
  }

  continuar() {
    this.router.navigate([this.siguiente || '/transfers/inicio']);
  }

  registrarDestinatario() {
    console.log('Registrando destinatario...');
    const nuevoDestinatario: any = this.storage.getJson(
      LocalStorageKeys.NUEVO_DESTINATARIO,
    );
    console.log('Datos del nuevo destinatario:', nuevoDestinatario);
    this.storage.setJson(LocalStorageKeys.DESTINATARIO, {
      nombre: nuevoDestinatario.nombre,
      numeroCuenta: nuevoDestinatario.numeroCuenta,
      tipoCuenta: nuevoDestinatario.tipoCuenta,
      banco: nuevoDestinatario.banco,
      identificacion: nuevoDestinatario.identificacion || 'N/A',
      tipoInstitucion: nuevoDestinatario.tipoInstitucion || 'N/A',
    });

    console.log(this.storage.getJson(LocalStorageKeys.DESTINATARIO));

    setTimeout(() => {
      this.continuar();

      this.estado = 'success';
      this.mensaje = 'Estamos realizando la transferencia';
      this.detalle = 'Puedes continuar con el siguiente paso';
    }, 3000);
  }
}
