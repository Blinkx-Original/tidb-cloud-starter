// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class', // ya usas toggle; si usas data-theme, ajusta aquí
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          // fondos base
          light: '#ffffff',
          dark:  '#000000',
        },
        // texto principal
        ink: {
          light: '#111111',
          dark:  '#ffffff',
        },
        // grises mínimos para divisores / cards
        line: {
          light: '#e5e5e5',
          dark:  '#1f1f1f',
        },
        // AZUL de acento (luminoso)
        accent: {
          DEFAULT: '#2f81f7',   // base
          hover:   '#3b82f6',   // hover sutil
          ring:    '#60a5fa',   // “halo” (ring)
        },
      },
      boxShadow: {
        // leve “glow” sutil alrededor del CTA
        'accent-glow': '0 0 0 2px rgba(96,165,250,0.35), 0 8px 24px rgba(47,129,247,0.25)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
} satisfies Config;

