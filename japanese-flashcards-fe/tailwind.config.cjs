/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial']
      },
      colors: {
        brand: {
          DEFAULT: '#111827',
          light: '#1f2937'
        },
        accent: {
          DEFAULT: '#3b82f6',
          soft: '#dbeafe'
        }
      }
    },
  },
  plugins: [],
}; 