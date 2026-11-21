/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta monocromática fosca
        canvas: '#09090B',
        surface: { DEFAULT: '#121214', 2: '#18181B', 3: '#1E1E22' },
        line: { DEFAULT: '#27272A', strong: '#3F3F46' },
        ink: { DEFAULT: '#FAFAFA', muted: '#A1A1AA', dim: '#71717A', faint: '#52525B' },
        // Indicadores funcionais (somente desempenho/corte)
        ok: '#16A34A',
        warn: '#D97706',
        bad: '#DC2626',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: { none: 'none' },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-in': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
      },
      animation: {
        'fade-in': 'fade-in .12s ease-out',
        'slide-in': 'slide-in .18s ease-out',
      },
    },
  },
  plugins: [],
};
