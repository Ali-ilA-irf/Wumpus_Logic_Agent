/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        void: {
          900: '#050508',
          800: '#0a0a12',
          700: '#0f0f1a',
          600: '#14141f',
        },
        neon: {
          cyan:    '#00f5ff',
          purple:  '#bf5fff',
          gold:    '#ffd700',
          red:     '#ff4757',
          green:   '#2ed573',
        },
      },
      boxShadow: {
        'neon-cyan':   '0 0 8px #00f5ff, 0 0 20px rgba(0,245,255,0.4)',
        'neon-purple': '0 0 8px #bf5fff, 0 0 20px rgba(191,95,255,0.4)',
        'neon-gold':   '0 0 8px #ffd700, 0 0 20px rgba(255,215,0,0.4)',
        'neon-red':    '0 0 8px #ff4757, 0 0 20px rgba(255,71,87,0.4)',
        'neon-green':  '0 0 8px #2ed573, 0 0 20px rgba(46,213,115,0.4)',
      },
    },
  },
  plugins: [],
}
