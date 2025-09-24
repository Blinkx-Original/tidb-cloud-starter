// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Azul de acento (CTA)
        accent: {
          DEFAULT: '#2f81f7',
          hover:   '#3b82f6',
          ring:    '#60a5fa',
        },
      },
      boxShadow: {
        'accent-glow':
          '0 0 0 2px rgba(96,165,250,0.35), 0 8px 24px rgba(47,129,247,0.25)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
};

export default config;

