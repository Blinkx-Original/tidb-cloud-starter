"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Importa el overlay de navegación existente
import NavOverlay from "./Layout/NavOverlay";

/**
 * Cabecera responsive para BlinkX.
 *
 * Muestra el logo a la izquierda y un botón de hamburguesa a la derecha.
 * Al pulsar el botón se abre un panel flotante con enlaces. El icono
 * cambia a ✕ cuando el menú está abierto. El overlay se ancla justo
 * debajo de la cabecera y se cierra al hacer clic fuera o al pulsar ESC.
 */
export default function Header() {
  // Estado para saber si el menú móvil está abierto
  const [isOpen, setIsOpen] = useState(false);

  // Alterna entre abrir/cerrar el menú
  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <>
      {/* Asigna un id para que NavOverlay pueda medir la altura del header */}
      <header
        id="site-header"
        className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200"
      >
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo que enlaza a la página de inicio */}
            <Link href="/">
              <Image
                src="/brand/blinkx.webp"
                alt="BlinkX"
                width={120}
                height={30}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>

          <div className="flex items-center">
            {/* Botón de hamburguesa/cerrar para el menú flotante */}
            <button
              type="button"
              aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
              className="text-2xl leading-none"
              onClick={toggleMenu}
            >
              {isOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {/* Overlay: se monta solo cuando isOpen es true */}
      <NavOverlay open={isOpen} onClose={() => setIsOpen(false)} anchorId="site-header" />
    </>
  );
}
