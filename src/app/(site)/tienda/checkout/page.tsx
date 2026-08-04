"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/format";

export default function CheckoutPage() {
  const { items, totalCents, clearCart } = useCart();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotConfigured(false);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customerEmail: email }),
      });
      const data = await res.json();

      if (res.status === 501) {
        setNotConfigured(true);
        return;
      }
      if (!res.ok) {
        setError(data.error || "No se pudo iniciar el pago. Intenta de nuevo.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Ocurrió un error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function handleTestOrder() {
    clearCart();
    router.push("/tienda/checkout/gracias");
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">No hay productos en tu carrito</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Finalizar compra</h1>

      <div className="mt-8 rounded-lg border border-black/10 p-4 text-sm">
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>{formatPrice(totalCents, items[0]?.currency || "MXN")}</span>
        </div>
      </div>

      <form onSubmit={handleCheckout} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Correo electrónico</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-black/15 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-black px-8 py-3 text-sm text-white hover:opacity-80 disabled:opacity-50"
        >
          {loading ? "Redirigiendo…" : "Pagar con tarjeta"}
        </button>
      </form>

      {notConfigured && (
        <div className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">La pasarela de pago aún no está configurada.</p>
          <p className="mt-2">
            Agrega tu clave de Stripe (<code>STRIPE_SECRET_KEY</code>) en{" "}
            <code>.env.local</code> para aceptar pagos reales. Ver el README para
            instrucciones.
          </p>
          {process.env.NODE_ENV !== "production" && (
            <button
              onClick={handleTestOrder}
              className="mt-4 rounded-full border border-amber-400 px-4 py-2 text-xs hover:bg-amber-100"
            >
              Simular pedido de prueba (solo desarrollo)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
