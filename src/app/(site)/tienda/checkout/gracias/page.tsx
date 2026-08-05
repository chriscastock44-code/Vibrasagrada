"use client";

import { useEffect } from "react";
import Image from "next/image";
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
      <Image
        src="/brand/icon.png"
        alt=""
        width={140}
        height={100}
        className="mx-auto h-16 w-auto"
      />
      <h1 className="mt-6 text-3xl font-extrabold">¡Gracias por tu compra!</h1>
      <p className="mt-4 font-body text-black/60">
        Hemos recibido tu pedido. Te contactaremos por correo con los detalles
        de tu pieza personalizada.
      </p>
      <Link href="/tienda" className="btn-pop btn-pop-primary mt-8 inline-flex px-8 py-3 text-sm">
        Seguir viendo la tienda
      </Link>
    </div>
  );
}
