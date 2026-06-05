import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Bloque {
  dias: string[]; // claves: lun, mar, mie, jue, vie, sab, dom
  desde: string; // 'HH:MM'
  hasta: string; // 'HH:MM'
}

const DIAS = [
  { k: 'lun', l: 'Lun' },
  { k: 'mar', l: 'Mar' },
  { k: 'mie', l: 'Mié' },
  { k: 'jue', l: 'Jue' },
  { k: 'vie', l: 'Vie' },
  { k: 'sab', l: 'Sáb' },
  { k: 'dom', l: 'Dom' },
];

@Component({
  standalone: true,
  selector: 'app-horario-builder',
  imports: [CommonModule, FormsModule],
  templateUrl: './horario-builder.html',
})
export class HorarioBuilder {
  readonly DIAS = DIAS;
  bloques: Bloque[] = [{ dias: [], desde: '09:00', hasta: '18:00' }];

  private _value = '';
  /** Valor actual del horario (texto). Se muestra como referencia. */
  @Input() set value(v: string) {
    this._value = v || '';
  }
  get value() {
    return this._value;
  }

  @Output() valueChange = new EventEmitter<string>();

  toggleDia(b: Bloque, k: string) {
    const i = b.dias.indexOf(k);
    i >= 0 ? b.dias.splice(i, 1) : b.dias.push(k);
    this.emit();
  }

  isDia(b: Bloque, k: string) {
    return b.dias.includes(k);
  }

  addBloque() {
    this.bloques.push({ dias: [], desde: '09:00', hasta: '18:00' });
  }

  removeBloque(i: number) {
    this.bloques.splice(i, 1);
    this.emit();
  }

  /** Genera el texto estandarizado a partir de los bloques. */
  private formatDias(dias: string[]): string {
    const orden = DIAS.map((d) => d.k);
    const idxs = dias
      .map((d) => orden.indexOf(d))
      .filter((i) => i >= 0)
      .sort((a, b) => a - b);
    if (!idxs.length) return '';

    // Agrupar en rangos consecutivos
    const runs: number[][] = [];
    let run = [idxs[0]];
    for (let i = 1; i < idxs.length; i++) {
      if (idxs[i] === idxs[i - 1] + 1) {
        run.push(idxs[i]);
      } else {
        runs.push(run);
        run = [idxs[i]];
      }
    }
    runs.push(run);

    return runs
      .map((r) =>
        r.length >= 2
          ? `${DIAS[r[0]].l}-${DIAS[r[r.length - 1]].l}`
          : DIAS[r[0]].l,
      )
      .join(', ');
  }

  emit() {
    const partes = this.bloques
      .filter((b) => b.dias.length && b.desde && b.hasta)
      .map((b) => `${this.formatDias(b.dias)} ${b.desde} a ${b.hasta}`);
    const txt = partes.join(' · ');
    this._value = txt;
    this.valueChange.emit(txt);
  }
}
