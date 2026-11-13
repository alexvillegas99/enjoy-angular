/**
 * Colores de gráficos (ECharts) según el tema activo en <html data-theme>.
 * ECharts pinta en canvas y no lee variables CSS, por eso los colores viven aquí.
 * "polar"    = claro, azul de marca (Blanco / Marino / Azul Real).
 * "tormenta" = oscuro Grafito azul (Carbón / Grafito / Azul).
 * Cualquier otro valor conserva los colores originales.
 * Devuelve un objeto "vivo": siempre lee el tema activo en el momento de usarse.
 */
export interface ChartTheme {
  accent: string;
  accentRgb: string;
  accentLight: string;
  primary: string;
  secondary: string;
  mute: string;
  axis: string;
  split: string;
  ok: string;
  warn: string;
  danger: string;
  palette: string[];
}

const POLAR: ChartTheme = {
  accent: '#1565D8',        // Rojo Racing
  accentRgb: '228,0,43',
  accentLight: '#B7CDEE',   // Azul Glaciar
  primary: '#0A2A6E',       // Glaciar profundo
  secondary: '#5F8DB5',     // Glaciar medio
  mute: '#5A6E92',
  axis: '#DCE6F4',
  split: '#EEF3FB',
  ok: '#12A060',
  warn: '#D99A0B',
  danger: '#B4233A',
  palette: ['#1565D8', '#0A2A6E', '#B7CDEE', '#5F8DB5', '#7FA3C4', '#0B1B45', '#D99A0B'],
};

const TORMENTA: ChartTheme = {
  accent: '#3D7FF0',        // Naranja Seguridad
  accentRgb: '255,95,0',
  accentLight: '#FFA366',
  primary: '#0E1320',       // Negro Mate
  secondary: '#A3ABB5',     // Gris claro
  mute: '#9AA6BC',
  axis: '#6A717A',
  split: 'rgba(255,255,255,0.08)',
  ok: '#3DD68C',
  warn: '#F2B33D',
  danger: '#FF5A6A',
  palette: ['#3D7FF0', '#D1D6DC', '#0E1320', '#FFA366', '#8A929C', '#F2B33D', '#6FB7E8'],
};

const LEGACY: ChartTheme = {
  accent: '#FF9F1C',
  accentRgb: '255,159,28',
  accentLight: '#FFBF46',
  primary: '#152A47',
  secondary: '#5BA4F0',
  mute: '#7A869A',
  axis: '#E5E7EB',
  split: '#F3F4F6',
  ok: '#2BD67B',
  warn: '#FFBF46',
  danger: '#FF5C73',
  palette: ['#FF9F1C', '#5BA4F0', '#2BD67B', '#FFBF46', '#FF5C73', '#A07AFF', '#22C2D8'],
};

function current(): ChartTheme {
  const theme = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null;
  return theme === 'polar' ? POLAR : theme === 'tormenta' ? TORMENTA : LEGACY;
}

export function chartTheme(): ChartTheme {
  return new Proxy({} as ChartTheme, { get: (_t, key) => current()[key as keyof ChartTheme] });
}
