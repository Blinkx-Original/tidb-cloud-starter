// pages/_app.tsx
/* eslint-disable @next/next/no-before-interactive-script-outside-document */
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { RecoilRoot } from 'recoil';
import '@/styles/globals.css';

const LIGHT_THEME = 'winter'; // DaisyUI claro

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Forzar tema claro ANTES de cualquier render, sin FOUC */}
      <Script id="force-light" strategy="beforeInteractive">{`
        (function () {
          try {
            var root = document.documentElement;
            // borrar preferencia previa
            try { localStorage.removeItem('themePref'); } catch (e) {}
            // quitar clase dark y fijar tema DaisyUI claro
            root.classList.remove('dark');
            root.setAttribute('data-theme', '${LIGHT_THEME}');
            // Fallback inmediato por si hay CSS residual
            document.documentElement.style.backgroundColor = '#ffffff';
            document.body && (document.body.style.backgroundColor = '#ffffff');
            document.body && (document.body.style.color = '#000000');
          } catch (e) {}
        })();
      `}</Script>

      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>BlinkX</title>
      </Head>

      <RecoilRoot>
        {/* Contenedor global SIEMPRE claro */}
        <div className="min-h-screen bg-white text-black">
          <Component {...pageProps} />
        </div>
      </RecoilRoot>
    </>
  );
}


