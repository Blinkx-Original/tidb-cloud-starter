// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // usamos la clase "dark" (la activamos en _app y ThemeToggle)
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Fondos base
        surface: {
          light: '#ffffff',
          dark: '#000000',
        },
        // Texto principal
        ink: {
          light: '#111111',
          dark: '#ffffff',
        },
        // Divisores / bordes sutiles
        line: {
          light: '#e5e5e5',
          dark: '#1f1f1f',
        },
        // Azul de acento (CTA “luminoso”)
        accent: {
          DEFAULT: '#2f81f7', // base
          hover:   '#3b82f6', // hover
          ring:    '#60a5fa', // halo/ring
        },
      },
      boxShadow: {
        // glow sutil para botones azules
        'accent-glow': '0 0 0 2px rgba(96,165,250,0.35), 0 8px 24px rgba(47,129,247,0.25)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
};

export default config;

