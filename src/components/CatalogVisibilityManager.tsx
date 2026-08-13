"use client";

import { useRef, useState } from "react";
import type { Product } from "@/lib/types";

// Lista de todos los productos de Vibra Sagrada con un checkbox por
// producto: marcado = aparece en /catalogo, sin marcar = no aparece. Cada
// checkbox se guarda solo en cuanto lo tocas (sin botón de "guardar"
// aparte), mismo criterio que el resto de los toggles del admin.
export default function CatalogVisibilityManager({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [savingId, setSavingId] = useState<number | null>(null);
  // Un checkbox dentro de un <label> puede recibir el click nativo del
  // input Y el click reenviado por el label casi en el mismo tick — un
  // guard con useState no alcanza a bloquear el segundo porque el estado
  // no se actualiza sincrónicamente. Un ref sí, por eso se usa aquí en vez
  // de leer savingId directamente.
  const inFlightRef = useRef<number | null>(null);

  async function toggle(product: Product) {
    if (inFlightRef.current === product.id) return;
    inFlightRef.current = product.id;

    const next = !product.showInCatalog;
    setSavingId(product.id);
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, showInCatalog: next } : p))
    );
    try {
      await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showInCatalog: next }),
      });
    } catch {
      // Si falla la red, regresamos el checkbox a como estaba.
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, showInCatalog: !next } : p))
      );
    } finally {
      inFlightRef.current = null;
      setSavingId(null);
    }
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {products.map((product) => (
        <label
          key={product.id}
          className="card-pop flex cursor-pointer items-center gap-4 px-4 py-3"
        >
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt=""
              className="h-14 w-14 shrink-0 rounded-lg border-2 border-brand-black object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 border-brand-black bg-brand-cream text-[10px] text-black/30">
              Sin foto
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-sm font-bold text-black">{product.name}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              <span className="text-[11px] font-semibold tracking-wide text-black/45 uppercase">
                {product.category === "playera" ? "Playera" : "Tote"}
              </span>
              {!product.active && (
                <span className="tag-pop bg-white text-[10px] text-black/40">
                  Oculto en tienda
                </span>
              )}
            </div>
          </div>

          <input
            type="checkbox"
            checked={product.showInCatalog}
            onChange={() => toggle(product)}
            disabled={savingId === product.id}
            className="h-5 w-5 shrink-0 accent-brand-navy"
            aria-label={`Mostrar "${product.name}" en el catálogo`}
          />
        </label>
      ))}
    </div>
  );
}
