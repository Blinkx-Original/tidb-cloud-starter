// pages/_app.tsx
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import '@/styles/globals.css';

// Ajusta estos nombres si tus temas DaisyUI tienen otros ids
// (por ejemplo "light" / "dark" o "lofi" / "black")
const LIGHT_THEME = 'winter';
const DARK_THEME  = 'night';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Inicializa el tema ANTES de hidratar para evitar el flash claro/oscuro */}
      <Script id="theme-init" strategy="beforeInteractive">{`
        (function () {
          try {
            var LIGHT='${LIGHT_THEME}', DARK='${DARK_THEME}';
            var pref = localStorage.getItem('themePref') || 'auto';
            var dark = pref === 'dark' || (pref === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            document.documentElement.setAttribute('data-theme', dark ? DARK : LIGHT);
          } catch (e) {}
        })();
      `}</Script>

      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>BlinkX</title>
      </Head>

      <Component {...pageProps} />
    </>
  );
}

