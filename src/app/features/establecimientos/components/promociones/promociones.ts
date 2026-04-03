import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-promociones',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './promociones.html',
})
export class Promociones {

  @Input() initialData?: any;
  @Output() submitForm = new EventEmitter<any>();

  private fb = inject(FormBuilder);

  // ✅ INICIALIZADO (no error TS2564)
  form: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    identificacion: ['', Validators.required],
    telefono: [''],
    estado: [true],

    ciudades: [[]],     // IDs
    categorias: [[]],   // IDs

    detallePromocion: [null],
    detallePromocionesExtra: [[]],
  });

  ngOnInit() {
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.submitForm.emit(this.form.value as any);
  }
}
