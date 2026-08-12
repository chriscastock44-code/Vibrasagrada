"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartContext";

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-brand-black bg-brand-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 shrink items-center gap-2">
          <Link href="/" className="flex min-w-0 shrink items-center gap-2">
            <Image
              src="/brand/icon.png"
              alt=""
              width={40}
              height={28}
              className="h-7 w-auto shrink-0 sm:h-8"
              priority
            />
            {/* Wordmark recortado directo del logo oficial (misma tipografía
                de marca) — antes era texto con una fuente web que no
                correspondía al logotipo real. En mobile, junto con todo el
                nav, no cabía sin encimarse (ver AGENTS.md, no es cosa de "lo
                hago un poco más chico" — por eso se oculta y solo queda el
                ícono; el wordmark completo vuelve a partir de "sm"). */}
            <Image
              src="/brand/wordmark.png"
              alt="Vibra Sagrada"
              width={762}
              height={79}
              className="hidden h-5 w-auto sm:block"
              priority
            />
          </Link>
          {/* Marca hija — ícono chico junto al logo, siempre visible (incluso
              en mobile) porque ya no queda espacio para un wordmark propio
              ahí; lleva a la landing de presentación de Barks & Paws. */}
          <span className="shrink-0 text-black/20" aria-hidden="true">
            ×
          </span>
          <Link href="/barks-and-paws" className="shrink-0" aria-label="Barks & Paws — accesorios personalizados para mascotas">
            <Image
              src="/brand/barks-and-paws-icon.png"
              alt="Barks & Paws"
              width={199}
              height={143}
              className="h-6 w-auto sm:h-7"
            />
          </Link>
        </div>
        <nav className="flex shrink-0 items-center gap-3 font-body text-sm font-medium sm:gap-6">
          <Link href="/" className="hidden hover:text-brand-navy sm:inline">
            Inicio
          </Link>
          <Link href="/tienda" className="hover:text-brand-navy">
            Tienda
          </Link>
          <Link
            href="/tienda/carrito"
            className="tag-pop shrink-0 whitespace-nowrap bg-brand-yellow hover:bg-brand-pink"
          >
            Carrito{totalItems > 0 ? ` · ${totalItems}` : ""}
          </Link>
        </nav>
      </div>
    </header>
  );
}
