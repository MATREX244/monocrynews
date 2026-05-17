/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mono: {
          bg: '#111111',
          surface: '#1a1a1a',
          card: '#1e1e1e',
          border: '#2a2a2a',
          accent: '#0079C1',
          'accent-hover': '#0066a8',
          text: '#e8e8e8',
          muted: '#888888',
          danger: '#ef4444',
          success: '#22c55e',
          warning: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif']
      }
    }
  },
  plugins: []
}
