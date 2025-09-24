// components/v2/Layout/Footer.tsx
'use client';

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm opacity-70">
        © {new Date().getFullYear()} BlinkX
      </div>
    </footer>
  );
}
