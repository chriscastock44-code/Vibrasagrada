"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, PersonalizationField } from "@/lib/types";

const EXAMPLE_FIELDS: PersonalizationField[] = [
  {
    id: "texto_grabado",
    type: "text",
    label: "Texto a grabar",
    required: true,
    maxLength: 25,
    helpText: "Máximo 25 caracteres.",
  },
  {
    id: "color",
    type: "select",
    label: "Color",
    required: true,
    options: ["Dorado", "Plateado"],
  },
];

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
  const [images, setImages] = useState((initialProduct?.images || []).join("\n"));
  const [stock, setStock] = useState(initialProduct?.stock?.toString() || "0");
  const [active, setActive] = useState(initialProduct?.active ?? true);
  const [fieldsJson, setFieldsJson] = useState(
    JSON.stringify(initialProduct?.personalizationFields ?? EXAMPLE_FIELDS, null, 2)
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

    let personalizationFields: PersonalizationField[];
    try {
      personalizationFields = JSON.parse(fieldsJson);
    } catch {
      setError("Los campos de personalización deben ser un JSON válido.");
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
            images: images.split("\n").map((s) => s.trim()).filter(Boolean),
            personalizationFields,
            stock: parseInt(stock, 10) || 0,
            active,
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
        <label className="mb-1 block text-sm font-medium">Nombre</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full rounded border border-black/15 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
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
          className="w-full rounded border border-black/15 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded border border-black/15 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Precio</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded border border-black/15 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div className="w-32">
          <label className="mb-1 block text-sm font-medium">Moneda</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full rounded border border-black/15 bg-white px-3 py-2 text-sm"
          >
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div className="w-32">
          <label className="mb-1 block text-sm font-medium">Stock</label>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full rounded border border-black/15 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Imágenes (una URL por línea)
        </label>
        <textarea
          value={images}
          onChange={(e) => setImages(e.target.value)}
          rows={3}
          placeholder="https://..."
          className="w-full rounded border border-black/15 bg-white px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-black/50">
          Por ahora las imágenes se referencian por URL. Más adelante podemos
          agregar subida directa de archivos.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Campos de personalización (JSON)
        </label>
        <textarea
          value={fieldsJson}
          onChange={(e) => setFieldsJson(e.target.value)}
          rows={10}
          className="w-full rounded border border-black/15 bg-white px-3 py-2 font-mono text-xs"
        />
        <p className="mt-1 text-xs text-black/50">
          Tipos disponibles: <code>text</code>, <code>textarea</code>,{" "}
          <code>select</code> (con <code>options</code>), <code>image</code>.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Publicado (visible en la tienda)
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-black px-8 py-3 text-sm text-white hover:opacity-80 disabled:opacity-50"
      >
        {loading ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear producto"}
      </button>
    </form>
  );
}
