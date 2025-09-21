// pages/_app.tsx
import type { AppProps } from 'next/app';
import { RecoilRoot } from 'recoil';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import 'styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <Component {...pageProps} />
      {/* Vercel Analytics: funciona en cualquier dominio */}
      <Analytics />
      <SpeedInsights />
    </RecoilRoot>
  );
}

