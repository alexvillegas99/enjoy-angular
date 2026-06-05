import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  ImageCropperComponent,
  ImageCroppedEvent,
  ImageTransform,
} from 'ngx-image-cropper';
import { LucideAngularModule } from 'lucide-angular';

/**
 * Modal reutilizable de recorte de imágenes (estilo Facebook): permite
 * reposicionar, hacer zoom y rotar antes de recortar. Recorte LIBRE
 * (sin relación de aspecto fija). Devuelve la imagen recortada en base64.
 */
@Component({
  standalone: true,
  selector: 'app-image-cropper-modal',
  imports: [ImageCropperComponent, LucideAngularModule],
  templateUrl: './image-cropper-modal.html',
})
export class ImageCropperModal {
  /** Archivo origen a recortar */
  @Input() imageFile: File | null = null;
  /** Título del modal */
  @Input() title = 'Recortar imagen';

  /** Emite el resultado recortado en base64 (data URL) */
  @Output() cropped = new EventEmitter<string>();
  /** Emite cuando se cancela el recorte */
  @Output() cancelled = new EventEmitter<void>();

  transform: ImageTransform = {
    scale: 1,
    rotate: 0,
    flipH: false,
    flipV: false,
  };

  private resultado = '';
  procesando = false;

  onCropped(event: ImageCroppedEvent) {
    this.resultado = event.base64 || '';
  }

  zoomIn() {
    this.transform = {
      ...this.transform,
      scale: Math.min((this.transform.scale ?? 1) + 0.1, 4),
    };
  }

  zoomOut() {
    this.transform = {
      ...this.transform,
      scale: Math.max((this.transform.scale ?? 1) - 0.1, 0.2),
    };
  }

  rotar() {
    this.transform = {
      ...this.transform,
      rotate: ((this.transform.rotate ?? 0) + 90) % 360,
    };
  }

  reset() {
    this.transform = { scale: 1, rotate: 0, flipH: false, flipV: false };
  }

  aplicar() {
    if (this.resultado) {
      this.cropped.emit(this.resultado);
    }
  }

  cancelar() {
    this.cancelled.emit();
  }
}
