"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, PersonalizationField } from "@/lib/types";

const EXAMPLE_FIELDS: PersonalizationField[] = [
  {
    id: "texto_estampado",
    type: "text",
    label: "Texto o nombre a estampar",
    required: true,
    maxLength: 25,
    helpText: "Máximo 25 caracteres.",
  },
  {
    id: "color_prenda",
    type: "select",
    label: "Color de la prenda",
    required: true,
    options: ["Crudo", "Negro", "Azul marino"],
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
  const [images, setImages] = useState<string[]>(initialProduct?.images || []);
  const [manualUrl, setManualUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(true);

    try {
      const configRes = await fetch("/api/cloudinary-config");
      const config: { cloudName: string | null; uploadPreset: string | null } =
        await configRes.json();

      if (!config.cloudName || !config.uploadPreset) {
        setUploadError(
          "La subida de imágenes no está configurada todavía (faltan las variables de Cloudinary)."
        );
        return;
      }

      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", config.uploadPreset);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error?.message || "No se pudo subir una de las imágenes.");
        }
        uploadedUrls.push(data.secure_url as string);
      }
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  function handleAddManualUrl() {
    const url = manualUrl.trim();
    if (!url) return;
    setImages((prev) => [...prev, url]);
    setManualUrl("");
  }

  function handleRemoveImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (uploading) {
      setError("Espera a que terminen de subirse las imágenes antes de guardar.");
      return;
    }

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
            images,
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

        {images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {images.map((url, index) => (
              <div key={`${url}-${index}`} className="relative h-24 w-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="h-24 w-24 rounded-lg border-2 border-brand-black object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  aria-label="Quitar imagen"
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-brand-black bg-white text-xs font-bold leading-none"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="btn-pop inline-flex cursor-pointer px-4 py-2 text-sm">
          {uploading ? "Subiendo…" : "+ Subir imagen"}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(e) => {
              handleFilesSelected(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />
        </label>

        {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}

        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="O pega una URL de imagen"
            className="flex-1 rounded-lg border-2 border-brand-black bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          />
          <button
            type="button"
            onClick={handleAddManualUrl}
            className="rounded-lg border-2 border-brand-black bg-white px-4 py-2 text-sm font-semibold"
          >
            Agregar
          </button>
        </div>

        <p className="mt-1 font-body text-xs text-black/50">
          Sube una o varias fotos directamente, o pega una URL si ya tienes la
          imagen en otro lugar.
        </p>
      </div>

      <div>
        <label className="mb-1 block font-body text-sm font-semibold">
          Campos de personalización (JSON)
        </label>
        <textarea
          value={fieldsJson}
          onChange={(e) => setFieldsJson(e.target.value)}
          rows={10}
          className="w-full rounded-lg border-2 border-brand-black bg-white px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-yellow"
        />
        <p className="mt-1 font-body text-xs text-black/50">
          Tipos disponibles: <code>text</code>, <code>textarea</code>,{" "}
          <code>select</code> (con <code>options</code>), <code>image</code>.
        </p>
      </div>

      <label className="flex items-center gap-2 font-body text-sm">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Publicado (visible en la tienda)
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
