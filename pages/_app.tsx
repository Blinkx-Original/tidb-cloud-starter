// pages/_app.tsx
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { RecoilRoot } from 'recoil';
import '@/styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>BlinkX</title>
      </Head>

      <RecoilRoot>
        {/* Modo claro permanente */}
        <div className="min-h-screen bg-white text-black">
          <Component {...pageProps} />
        </div>
      </RecoilRoot>
    </>
  );
}



