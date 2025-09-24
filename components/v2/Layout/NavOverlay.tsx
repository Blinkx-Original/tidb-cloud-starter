// components/v2/Layout/NavOverlay.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  onClose: () => void;
  /** id del header para calcular su altura y ubicar el panel debajo */
  anchorId: string; // normalmente "site-header"
};

export default function NavOverlay({ open, onClose, anchorId }: Props) {
  const [top, setTop] = useState<number>(56); // altura fallback
  const mountedRef = useRef(false);

  // Medir la altura real del header y ubicar el panel justo debajo
  useEffect(() => {
    function measure() {
      const el = document.getElementById(anchorId);
      if (!el) return setTop(56);
      const rect = el.getBoundingClientRect();
      setTop(rect.bottom); // coordenada en viewport
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [anchorId]);

  // Cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Target del portal
  const target = useMemo(
    () => (typeof window !== 'undefined' ? document.body : null),
    []
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  if (!open || !mountedRef.current || !target) return null;

  return createPortal(
    <>
      {/* Backdrop transparente: captura clic fuera, no oscurece la página */}
      <div className="fixed inset-0 z-[900]" onClick={onClose} aria-hidden="true" />

      {/* Panel flotante: no modifica la altura del header ni el layout */}
      <nav
        className="fixed right-4 z-[1000] w-64 bg-white border border-black/10 shadow-xl rounded-2xl"
        style={{ top }}
        role="menu"
      >
        <ul className="flex flex-col p-2">
          <li>
            <Link
              href="/"
              className="block px-4 py-2 hover:bg-gray-100 rounded"
              onClick={onClose}
              role="menuitem"
            >
              Inicio
            </Link>
          </li>
          <li>
            <Link
              href="/categories"
              className="block px-4 py-2 hover:bg-gray-100 rounded"
              onClick={onClose}
              role="menuitem"
            >
              Categorías
            </Link>
          </li>
          <li>
            <Link
              href="/blog"
              className="block px-4 py-2 hover:bg-gray-100 rounded"
              onClick={onClose}
              role="menuitem"
            >
              Blog
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="block px-4 py-2 hover:bg-gray-100 rounded"
              onClick={onClose}
              role="menuitem"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="block px-4 py-2 hover:bg-gray-100 rounded"
              onClick={onClose}
              role="menuitem"
            >
              Contacto
            </Link>
          </li>
        </ul>
      </nav>
    </>,
    target
  );
}
