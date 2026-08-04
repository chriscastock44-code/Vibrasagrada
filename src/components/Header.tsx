"use client";

import Link from "next/link";
import { useCart } from "./CartContext";

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[var(--background)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-[0.2em] uppercase">
          Vobra Sagrada
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:opacity-70">
            Inicio
          </Link>
          <Link href="/tienda" className="hover:opacity-70">
            Tienda
          </Link>
          <Link href="/tienda/carrito" className="hover:opacity-70">
            Carrito{totalItems > 0 ? ` (${totalItems})` : ""}
          </Link>
        </nav>
      </div>
    </header>
  );
}
