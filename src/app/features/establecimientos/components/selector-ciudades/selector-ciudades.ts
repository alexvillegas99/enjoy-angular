import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CiudadesService } from '../../../../services/ciudad.service';

@Component({
  standalone: true,
  selector: 'app-selector-ciudades',
  imports: [CommonModule],
  templateUrl: './selector-ciudades.html',
})
export class SelectorCiudades {
  private svc = inject(CiudadesService);

  ciudades: any[] = [];
  selectedIds: string[] = [];

  private _value: string[] = [];

  @Input()
  set value(val: string[]) {
    this._value = val || [];
    this.tryNormalize();
  }

  get value() {
    return this._value;
  }

  @Output() valueChange = new EventEmitter<string[]>();

  ngOnInit() {
    this.svc.listar({ estado: true, limit: 500 }).subscribe((res) => {
      console.log('Ciudades obtenidas:', res); // Debug: Verificar la respuesta del backend
      // ⚠️ si tu backend devuelve { data, total }
      this.ciudades = res.items ?? res;

      this.tryNormalize();
    });
  }

  private tryNormalize() {
    if (!this.ciudades.length || !this._value.length) return;

    const isObjectId = (v: string) => /^[a-f\d]{24}$/i.test(v);

    if (isObjectId(this._value[0])) {
      this.selectedIds = [...this._value];
    } else {
      // viene como nombres
      this.selectedIds = this.ciudades
        .filter((c) => this._value.includes(c.nombre))
        .map((c) => c._id);
    }
  }

  toggle(id: string) {
    const idx = this.selectedIds.indexOf(id);

    if (idx >= 0) {
      this.selectedIds.splice(idx, 1);
    } else {
      this.selectedIds.push(id);
    }

    this.valueChange.emit([...this.selectedIds]);
  }

  isSelected(id: string) {
    return this.selectedIds.includes(id);
  }
}
