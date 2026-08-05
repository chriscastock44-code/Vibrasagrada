"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalCents } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-extrabold">Tu carrito está vacío</h1>
        <Link href="/tienda" className="btn-pop btn-pop-primary mt-6 inline-flex px-8 py-3 text-sm">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-extrabold">Carrito</h1>

      <ul className="mt-10 divide-y-2 divide-brand-black/10">
        {items.map((item, index) => (
          <li key={index} className="flex gap-4 py-6">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 border-brand-black bg-brand-cream">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="flex-1">
              <p className="font-heading font-bold">{item.name}</p>
              <p className="font-body text-sm text-black/60">
                {formatPrice(item.priceCents, item.currency)}
              </p>
              <ul className="mt-1 font-body text-xs text-black/50">
                {Object.entries(item.personalization).map(([key, value]) => (
                  <li key={key}>
                    {key}: {value.startsWith("data:") ? "(archivo adjunto)" : value}
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex items-center gap-3">
                <label className="font-body text-xs text-black/50">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(index, Number(e.target.value) || 1)}
                  className="w-16 rounded-lg border-2 border-brand-black px-2 py-1 font-body text-sm"
                />
                <button
                  onClick={() => removeItem(index)}
                  className="font-body text-xs font-semibold text-brand-pink hover:underline"
                >
                  Quitar
                </button>
              </div>
            </div>
            <p className="font-heading text-sm font-bold">
              {formatPrice(item.priceCents * item.quantity, item.currency)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex items-center justify-between border-t-2 border-brand-black pt-6">
        <p className="font-heading text-lg font-bold">Total</p>
        <p className="font-heading text-lg font-bold">
          {formatPrice(totalCents, items[0]?.currency || "MXN")}
        </p>
      </div>

      <div className="mt-8 flex justify-end">
        <Link href="/tienda/checkout" className="btn-pop btn-pop-primary px-8 py-3 text-sm">
          Ir a pagar
        </Link>
      </div>
    </div>
  );
}
