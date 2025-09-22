/* eslint-disable react/no-unknown-property */
'use client';

import Link from 'next/link';
import SearchPill from '@/components/SearchPill';

export default function Header() {
  return (
    <header className="hdr">
      <div className="row">
        <div className="left"><Link href="/">YourLogo</Link></div>
        <div className="center"><SearchPill /></div>
        <div className="right"><button className="hamburger" aria-label="Menu">☰</button></div>
      </div>
      <style jsx>{`
        .hdr { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,0.8); backdrop-filter: blur(8px); border-bottom: 1px solid #eee; }
        .row { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px; padding: 10px 16px; }
        .left { font-weight: 700; }
        .center { display: flex; justify-content: center; }
      `}</style>
    </header>
  );
}
