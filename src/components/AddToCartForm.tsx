"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import type { Product } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border-2 border-brand-black px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow";

export default function AddToCartForm({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const soldOut = product.stock <= 0;

  function setValue(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  function handleFile(id: string, file: File | null) {
    if (!file) {
      setValue(id, "");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setValue(id, String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    for (const field of product.personalizationFields) {
      if (field.required && !values[field.id]) {
        setError(`Por favor completa: ${field.label}`);
        return;
      }
    }

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      currency: product.currency,
      image: product.images[0],
      quantity,
      personalization: values,
    });
    setAdded(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {product.personalizationFields.map((field) => (
        <div key={field.id}>
          <label className="mb-1 block font-body text-sm font-semibold">
            {field.label}
            {field.required ? " *" : ""}
          </label>

          {field.type === "text" && (
            <input
              type="text"
              maxLength={field.maxLength}
              required={field.required}
              value={values[field.id] || ""}
              onChange={(e) => setValue(field.id, e.target.value)}
              className={inputClass}
            />
          )}

          {field.type === "textarea" && (
            <textarea
              required={field.required}
              value={values[field.id] || ""}
              onChange={(e) => setValue(field.id, e.target.value)}
              className={inputClass}
              rows={3}
            />
          )}

          {field.type === "select" && (
            <select
              required={field.required}
              value={values[field.id] || ""}
              onChange={(e) => setValue(field.id, e.target.value)}
              className={inputClass}
            >
              <option value="">Selecciona una opción</option>
              {(field.options || []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {field.type === "image" && (
            <input
              type="file"
              accept="image/*"
              required={field.required}
              onChange={(e) => handleFile(field.id, e.target.files?.[0] || null)}
              className="w-full text-sm"
            />
          )}

          {field.helpText && (
            <p className="mt-1 font-body text-xs text-black/50">{field.helpText}</p>
          )}
        </div>
      ))}

      <div>
        <label className="mb-1 block font-body text-sm font-semibold">Cantidad</label>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          className={`${inputClass} w-24`}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {soldOut ? (
        <p className="text-sm text-red-600">Este producto está agotado por ahora.</p>
      ) : added ? (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/tienda/carrito")}
            className="btn-pop btn-pop-primary px-6 py-3 text-sm"
          >
            Ir al carrito
          </button>
          <button
            type="button"
            onClick={() => setAdded(false)}
            className="btn-pop btn-pop-outline px-6 py-3 text-sm"
          >
            Agregar otro
          </button>
        </div>
      ) : (
        <button type="submit" className="btn-pop btn-pop-primary px-8 py-3 text-sm">
          Agregar al carrito
        </button>
      )}
    </form>
  );
}
