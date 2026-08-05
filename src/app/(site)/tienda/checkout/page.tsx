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
        <h1 className="text-2xl font-extrabold">No hay productos en tu carrito</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-extrabold">Finalizar compra</h1>

      <div className="card-pop mt-8 p-4 font-body text-sm">
        <div className="flex justify-between font-heading font-bold">
          <span>Total</span>
          <span>{formatPrice(totalCents, items[0]?.currency || "MXN")}</span>
        </div>
      </div>

      <form onSubmit={handleCheckout} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block font-body text-sm font-semibold">
            Correo electrónico
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border-2 border-brand-black px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-pop btn-pop-primary w-full py-3 text-sm disabled:opacity-50"
        >
          {loading ? "Redirigiendo…" : "Pagar con tarjeta"}
        </button>
      </form>

      {notConfigured && (
        <div className="mt-8 rounded-2xl border-2 border-brand-black bg-brand-yellow/30 p-4 font-body text-sm">
          <p className="font-heading font-bold">
            La pasarela de pago aún no está configurada.
          </p>
          <p className="mt-2">
            Agrega tu clave de Stripe (<code>STRIPE_SECRET_KEY</code>) en{" "}
            <code>.env.local</code> para aceptar pagos reales. Ver el README para
            instrucciones.
          </p>
          {process.env.NODE_ENV !== "production" && (
            <button onClick={handleTestOrder} className="btn-pop btn-pop-outline mt-4 px-4 py-2 text-xs">
              Simular pedido de prueba (solo desarrollo)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
