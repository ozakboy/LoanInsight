/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans TC"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      colors: {
        brand: {
          royal: '#1e40af',
          indigo: '#312e81',
        },
      },
      boxShadow: {
        focus: '0 0 0 4px rgba(59, 130, 246, 0.25)',
      },
    },
  },
  plugins: [],
}
