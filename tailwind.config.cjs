/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e6f7f7',
          100: '#b3e9e8',
          200: '#80dbd9',
          300: '#4dcdca',
          400: '#26bfbb',
          500: '#1da19e',
          600: '#178381',
          700: '#116564',
          800: '#0b4747',
          900: '#052929'
        },
        accent: {
          orange: '#FF8C42',
          yellow: '#FFD166',
          purple: '#9B6B9E',
          navy: '#2C5F7C'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Poppins', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
}
