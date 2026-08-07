"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import DeleteProductButton from "./DeleteProductButton";

function moveItem<T>(list: T[], from: number, to: number): T[] {
  const copy = list.slice();
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);
  return copy;
}

// Tabla de productos del admin con orden manual por arrastrar y soltar.
// El orden se guarda de inmediato en cuanto sueltas la fila (sortOrder en
// la base de datos), y ese mismo orden es el que ve la tienda.
export default function ProductTable({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Firefox necesita datos reales en dataTransfer para permitir el drag.
    e.dataTransfer.setData("text/plain", String(index));
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setProducts((prev) => moveItem(prev, draggedIndex, index));
    setDraggedIndex(index);
  }

  async function handleDragEnd() {
    setDraggedIndex(null);
    setSaving(true);
    try {
      await fetch("/api/admin/reorder-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: products.map((p) => p.id) }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {saving && (
        <p className="mb-2 font-body text-xs text-black/40">Guardando orden…</p>
      )}
      <table className="card-pop w-full border-collapse overflow-hidden font-body text-sm">
        <thead>
          <tr className="border-b-2 border-brand-black bg-brand-cream text-left text-black/60">
            <th className="w-8 px-2 py-2"></th>
            <th className="px-4 py-2">Producto</th>
            <th className="px-4 py-2">Categoría</th>
            <th className="px-4 py-2">Precio</th>
            <th className="px-4 py-2">Stock</th>
            <th className="px-4 py-2">Estado</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr
              key={product.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`cursor-grab border-b border-black/10 active:cursor-grabbing ${
                draggedIndex === index ? "opacity-40" : ""
              }`}
            >
              <td className="px-2 py-3 text-center text-black/30" aria-hidden="true">
                ⠿
              </td>
              <td className="px-4 py-3">
                <p className="font-heading font-bold">{product.name}</p>
                <p className="text-xs text-black/40">/{product.slug}</p>
              </td>
              <td className="px-4 py-3 capitalize">
                {product.category === "playera" ? "Playera" : "Tote"}
              </td>
              <td className="px-4 py-3">
                {formatPrice(product.priceCents, product.currency)}
              </td>
              <td className="px-4 py-3">{product.stock}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {product.active ? (
                    <span className="tag-pop bg-brand-yellow text-[10px]">Publicado</span>
                  ) : (
                    <span className="tag-pop bg-white text-[10px] text-black/40">Oculto</span>
                  )}
                  {product.featured && (
                    <span className="tag-pop bg-brand-pink text-[10px] text-white">
                      Destacado
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/productos/${product.id}`}
                  className="text-sm font-semibold underline hover:text-brand-navy"
                >
                  Editar
                </Link>
                <DeleteProductButton productId={product.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
