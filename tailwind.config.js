/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'color-primary': 'var(--color-primary)',
        'color-primary-soft': 'var(--color-primary-soft)',
        'color-accent': 'var(--color-accent)',
        'color-accent-hover': 'var(--color-accent-hover)',
        'color-accent-light': 'var(--color-accent-light)',
      },
      fontFamily: {
        'roboto': ['Roboto', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
  future: {
    useOklch: false,
  },
}
