"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartContext";

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-brand-black bg-brand-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
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
