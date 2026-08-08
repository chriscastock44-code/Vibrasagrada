"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartContext";

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-brand-black bg-brand-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand/icon.png"
            alt=""
            width={40}
            height={28}
            className="h-8 w-auto"
            priority
          />
          {/* Wordmark recortado directo del logo oficial (misma tipografía
              de marca) — antes era texto con una fuente web que no
              correspondía al logotipo real. */}
          <Image
            src="/brand/wordmark.png"
            alt="Vibra Sagrada"
            width={762}
            height={79}
            className="h-5 w-auto"
            priority
          />
        </Link>
        <nav className="flex items-center gap-6 font-body text-sm font-medium">
          <Link href="/" className="hover:text-brand-navy">
            Inicio
          </Link>
          <Link href="/tienda" className="hover:text-brand-navy">
            Tienda
          </Link>
          <Link
            href="/tienda/carrito"
            className="tag-pop bg-brand-yellow hover:bg-brand-pink"
          >
            Carrito{totalItems > 0 ? ` · ${totalItems}` : ""}
          </Link>
        </nav>
      </div>
    </header>
  );
}
