"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";

export default function ThankYouPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold">¡Gracias por tu compra!</h1>
      <p className="mt-4 text-black/60">
        Hemos recibido tu pedido. Te contactaremos por correo con los detalles
        de tu producto personalizado.
      </p>
      <Link
        href="/tienda"
        className="mt-8 inline-block rounded-full bg-black px-8 py-3 text-sm text-white hover:opacity-80"
      >
        Seguir viendo la tienda
      </Link>
    </div>
  );
}
