import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriasService } from '../../../../services/categorias.service';

@Component({
  standalone: true,
  selector: 'app-selector-categorias',
  imports: [CommonModule],
  templateUrl: './selector-categorias.html'
})
export class SelectorCategorias {

  private svc = inject(CategoriasService);

  categorias: any[] = [];
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
    this.svc.getActivas().subscribe(res => {
      this.categorias = res;
      this.tryNormalize();
    });
  }

  private tryNormalize() {
    if (!this.categorias.length || !this._value.length) return;

    const isObjectId = (v: string) => /^[a-f\d]{24}$/i.test(v);

    if (isObjectId(this._value[0])) {
      this.selectedIds = [...this._value];
    } else {
      this.selectedIds = this.categorias
        .filter(c => this._value.includes(c.nombre))
        .map(c => c._id);
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
