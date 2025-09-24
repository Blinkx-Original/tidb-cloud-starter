// pages/_app.tsx
/* eslint-disable @next/next/no-before-interactive-script-outside-document */
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { RecoilRoot } from 'recoil';
import '@/styles/globals.css';

// Ajusta estos nombres a tus temas DaisyUI
const LIGHT_THEME = 'winter';
const DARK_THEME = 'night';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Forzamos el tema antes de hidratar para evitar el flash claro/oscuro */}
      <Script id="theme-init" strategy="beforeInteractive">{`
        (function () {
          try {
            var LIGHT='${LIGHT_THEME}', DARK='${DARK_THEME}';
            var pref = localStorage.getItem('themePref') || 'auto';
            var dark = pref === 'dark' || (pref === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            var root = document.documentElement;
            root.setAttribute('data-theme', dark ? DARK : LIGHT);
            // IMPORTANTE: habilitar utilidades Tailwind "dark:"
            root.classList.toggle('dark', dark);
          } catch (e) {}
        })();
      `}</Script>

      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>BlinkX</title>
      </Head>

      {/* Contexto global con fondo estilo Vercel */}
      <RecoilRoot>
        <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors">
          <Component {...pageProps} />
        </div>
      </RecoilRoot>
    </>
  );
}


