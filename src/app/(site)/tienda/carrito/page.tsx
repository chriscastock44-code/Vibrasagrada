"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalCents } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">Tu carrito está vacío</h1>
        <Link
          href="/tienda"
          className="mt-6 inline-block rounded-full bg-black px-8 py-3 text-sm text-white hover:opacity-80"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Carrito</h1>

      <ul className="mt-10 divide-y divide-black/10">
        {items.map((item, index) => (
          <li key={index} className="flex gap-4 py-6">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-black/5">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-black/60">
                {formatPrice(item.priceCents, item.currency)}
              </p>
              <ul className="mt-1 text-xs text-black/50">
                {Object.entries(item.personalization).map(([key, value]) => (
                  <li key={key}>
                    {key}: {value.startsWith("data:") ? "(archivo adjunto)" : value}
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex items-center gap-3">
                <label className="text-xs text-black/50">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(index, Number(e.target.value) || 1)}
                  className="w-16 rounded border border-black/15 px-2 py-1 text-sm"
                />
                <button
                  onClick={() => removeItem(index)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Quitar
                </button>
              </div>
            </div>
            <p className="text-sm font-medium">
              {formatPrice(item.priceCents * item.quantity, item.currency)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex items-center justify-between border-t border-black/10 pt-6">
        <p className="text-lg font-semibold">Total</p>
        <p className="text-lg font-semibold">
          {formatPrice(totalCents, items[0]?.currency || "MXN")}
        </p>
      </div>

      <div className="mt-8 flex justify-end">
        <Link
          href="/tienda/checkout"
          className="rounded-full bg-black px-8 py-3 text-sm text-white hover:opacity-80"
        >
          Ir a pagar
        </Link>
      </div>
    </div>
  );
}
