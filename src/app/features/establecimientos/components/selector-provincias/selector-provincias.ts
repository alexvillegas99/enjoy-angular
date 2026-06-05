import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProvinciasService, Provincia } from '../../../../services/provincia.service';

@Component({
  standalone: true,
  selector: 'app-selector-provincias',
  imports: [CommonModule, FormsModule],
  templateUrl: './selector-provincias.html',
})
export class SelectorProvincias {
  private svc = inject(ProvinciasService);

  provincias: Provincia[] = [];
  query = '';
  private _value: string | null = null;

  @Input()
  set value(val: string | null) {
    this._value = val || null;
  }
  get value() {
    return this._value;
  }

  @Output() valueChange = new EventEmitter<string | null>();

  private norm(s: string): string {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  ngOnInit() {
    this.svc.getActivas().subscribe((res) => (this.provincias = res || []));
  }

  get filtradas(): Provincia[] {
    const q = this.norm(this.query.trim());
    if (!q) return this.provincias;
    return this.provincias.filter((p) => this.norm(p.nombre).includes(q));
  }

  get seleccionada(): Provincia | undefined {
    return this.provincias.find((p) => p._id === this._value);
  }

  seleccionar(id: string) {
    this._value = id;
    this.valueChange.emit(id);
  }
}
