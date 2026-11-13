import { Component, signal } from '@angular/core';

export type EnjoyTheme = 'polar' | 'tormenta';
const KEY = 'enjoy-theme';

export function currentTheme(): EnjoyTheme {
  return document.documentElement.getAttribute('data-theme') === 'tormenta' ? 'tormenta' : 'polar';
}

/** Botón para alternar entre Edición Polar (claro) y Edición Tormenta (oscuro). */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button type="button" class="btn-icon theme-toggle" (click)="toggle()"
      [attr.aria-label]="theme() === 'polar' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'"
      [title]="theme() === 'polar' ? 'Tema oscuro (Tormenta)' : 'Tema claro (Polar)'">
      @if (theme() === 'polar') {
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
      } @else {
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
      }
    </button>
  `,
  styles: [`.theme-toggle{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:12px;border:1px solid var(--stroke);background:var(--glass);color:var(--text);cursor:pointer}`],
})
export class ThemeToggle {
  theme = signal<EnjoyTheme>(currentTheme());

  toggle() {
    const next: EnjoyTheme = this.theme() === 'polar' ? 'tormenta' : 'polar';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(KEY, next); } catch {}
    this.theme.set(next);
    // Los gráficos (canvas) se pintan con los colores del tema al generarse:
    // si hay alguno en pantalla, recargamos para repintarlos.
    if (document.querySelector('[echarts], .echarts, [_echarts_instance_]')) location.reload();
  }
}
