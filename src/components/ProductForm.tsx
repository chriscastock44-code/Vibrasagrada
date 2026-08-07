"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, ProductCategory } from "@/lib/types";
import ImagesField from "./ImagesField";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProductForm({ initialProduct }: { initialProduct?: Product }) {
  const router = useRouter();
  const isEdit = !!initialProduct;

  const [name, setName] = useState(initialProduct?.name || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [price, setPrice] = useState(
    initialProduct ? (initialProduct.priceCents / 100).toString() : ""
  );
  const [currency, setCurrency] = useState(initialProduct?.currency || "MXN");
  const [images, setImages] = useState<string[]>(initialProduct?.images || []);
  const [uploading, setUploading] = useState(false);
  const [stock, setStock] = useState(initialProduct?.stock?.toString() || "0");
  const [active, setActive] = useState(initialProduct?.active ?? true);
  const [featured, setFeatured] = useState(initialProduct?.featured ?? false);
  const [category, setCategory] = useState<ProductCategory>(
    initialProduct?.category ?? "tote"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (uploading) {
      setError("Espera a que terminen de subirse las imágenes antes de guardar.");
      return;
    }

    const priceCents = Math.round(parseFloat(price || "0") * 100);
    if (!name || !slug || Number.isNaN(priceCents)) {
      setError("Revisa el nombre, la URL (slug) y el precio.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        isEdit ? `/api/products/${initialProduct!.id}` : "/api/products",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            name,
            description,
            priceCents,
            currency,
            images,
            // Las piezas de Vibra Sagrada son 1 de 1, no productos
            // configurables — nunca se piden campos de personalización.
            personalizationFields: [],
            stock: parseInt(stock, 10) || 0,
            active,
            featured,
            category,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar el producto.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Ocurrió un error de red.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block font-body text-sm font-semibold">Nombre</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full rounded-lg border-2 border-brand-black bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
        />
      </div>

      <div>
        <label className="mb-1 block font-body text-sm font-semibold">
          URL (slug) — se usa en /tienda/{slug || "..."}
        </label>
        <input
          type="text"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          className="w-full rounded-lg border-2 border-brand-black bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
        />
      </div>

      <div>
        <label className="mb-1 block font-body text-sm font-semibold">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-lg border-2 border-brand-black bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
        />
      </div>

      <div className="w-48">
        <label className="mb-1 block font-body text-sm font-semibold">Categoría</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ProductCategory)}
          className="w-full rounded-lg border-2 border-brand-black bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
        >
          <option value="tote">Tote</option>
          <option value="playera">Playera</option>
        </select>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="mb-1 block font-body text-sm font-semibold">Precio</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border-2 border-brand-black bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          />
        </div>
        <div className="w-32">
          <label className="mb-1 block font-body text-sm font-semibold">Moneda</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full rounded-lg border-2 border-brand-black bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          >
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div className="w-32">
          <label className="mb-1 block font-body text-sm font-semibold">Stock</label>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full rounded-lg border-2 border-brand-black bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block font-body text-sm font-semibold">Imágenes</label>
        <ImagesField images={images} onChange={setImages} onUploadingChange={setUploading} />
      </div>

      <label className="flex items-center gap-2 font-body text-sm">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Publicado (visible en la tienda)
      </label>

      <label className="flex items-center gap-2 font-body text-sm">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
        />
        Mostrar en Destacados (home)
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || uploading}
        className="btn-pop btn-pop-primary px-8 py-3 text-sm disabled:opacity-50"
      >
        {loading
          ? "Guardando…"
          : uploading
            ? "Esperando a que suban las imágenes…"
            : isEdit
              ? "Guardar cambios"
              : "Crear producto"}
      </button>
    </form>
  );
}
