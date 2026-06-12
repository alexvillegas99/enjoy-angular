/**
 * Helpers de exportación para los reportes.
 * - exportCsv(filename, rows, headers?)  — descarga CSV.
 * - exportPdf(title)                     — usa window.print() con CSS .print-only
 *                                          (sin dependencias externas).
 */

export function exportCsv(
  filename: string,
  rows: any[],
  headers?: { key: string; label: string }[],
) {
  if (!rows?.length) return;
  const cols =
    headers ??
    Object.keys(rows[0]).map((k) => ({ key: k, label: k }));

  const esc = (v: any) => {
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n;]/.test(s) ? `"${s}"` : s;
  };

  const head = cols.map((c) => esc(c.label)).join(',');
  const body = rows
    .map((r) => cols.map((c) => esc(r[c.key])).join(','))
    .join('\n');

  const csv = '﻿' + head + '\n' + body; // BOM para Excel UTF-8
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function exportPdf(_titulo: string) {
  // Aprovecha el diálogo de impresión nativo del navegador.
  // Las pantallas de reportes tienen CSS @media print que oculta sidebar/
  // header y deja solo el contenido limpio.
  window.print();
}

export function formatMoney(n: number, currency = 'USD'): string {
  if (n === null || n === undefined || isNaN(n)) return '$0.00';
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(n);
}

export function formatNumber(n: number): string {
  if (n === null || n === undefined || isNaN(n)) return '0';
  return new Intl.NumberFormat('es-EC').format(n);
}

export function formatPct(n: number, digits = 1): string {
  if (n === null || n === undefined || isNaN(n)) return '0%';
  return `${(n * 100).toFixed(digits)}%`;
}

/** YYYY-MM-DD del primer día del mes en curso. */
export function inicioMesActualISO(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

/** YYYY-MM-DD de hoy. */
export function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** YYYY-MM-DD de hace N días. Útil como default amplio para reportes. */
export function haceDiasISO(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
