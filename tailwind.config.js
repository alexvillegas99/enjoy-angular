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
        'color-text-link': 'var(--color-text-link)',
        'service-transfer': 'var(--service-transfer)',
        'service-payments': 'var(--service-payments)',
        'service-topup': 'var(--service-topup)',
        'service-services': 'var(--service-services)',
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
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
