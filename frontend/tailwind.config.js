/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rr: {
          pink: '#E5007D',
          'pink-hover': '#c9006e',
          'pink-light': '#fce6f2',
          navy: '#17132E',
          'navy-light': '#252044',
          'navy-card': '#1e193b',
          purple: '#641078',
          'purple-light': '#801899',
          bg: '#F7F4FC',
          gold: '#FDB913',
          'gold-light': '#fff4d6',
          cyan: '#00D2D3'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'sans-serif']
      },
      boxShadow: {
        'rr-card': '0 10px 30px -5px rgba(23, 19, 46, 0.08), 0 4px 12px -2px rgba(23, 19, 46, 0.04)',
        'rr-hover': '0 20px 35px -5px rgba(229, 0, 125, 0.18), 0 8px 16px -2px rgba(23, 19, 46, 0.06)',
        'rr-glow': '0 0 25px rgba(229, 0, 125, 0.4)'
      }
    },
  },
  plugins: [],
}
