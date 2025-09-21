import type { AppProps } from 'next/app';
import { RecoilRoot } from 'recoil';
import { Analytics } from '@vercel/analytics/react';
import 'styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <Component {...pageProps} />
      {/* Vercel Analytics works on any domain/env */}
      <Analytics />
    </RecoilRoot>
  );
}

