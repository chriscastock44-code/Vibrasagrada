"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CustomDesignImage } from "@/lib/types";
import ImagesField from "./ImagesField";

function moveItem<T>(list: T[], from: number, to: number): T[] {
  const copy = list.slice();
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);
  return copy;
}

export default function CustomDesignImagesManager({
  initialImages,
}: {
  initialImages: CustomDesignImage[];
}) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Firefox necesita datos reales en dataTransfer para permitir el drag.
    e.dataTransfer.setData("text/plain", String(index));
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setImages((prev) => moveItem(prev, draggedIndex, index));
    setDraggedIndex(index);
  }

  async function handleDragEnd() {
    setDraggedIndex(null);
    setReordering(true);
    try {
      await fetch("/api/admin/reorder-custom-design-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: images.map((img) => img.id) }),
      });
      router.refresh();
    } finally {
      setReordering(false);
    }
  }

  async function handleAdd() {
    if (newImages.length === 0) {
      setError("Sube o pega primero la imagen que quieres agregar.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/custom-design-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: newImages[0], sortOrder: images.length }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo agregar la imagen.");
        return;
      }
      setImages((prev) => [...prev, data.image]);
      setNewImages([]);
      router.refresh();
    } catch {
      setError("Ocurrió un error de red.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await fetch(`/api/custom-design-images/${id}`, { method: "DELETE" });
      setImages((prev) => prev.filter((img) => img.id !== id));
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {images.length > 0 && (
        <div>
          <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="font-heading text-sm font-bold">
              Fotos actuales en el carrusel ({images.length})
            </h2>
            <p className="font-body text-xs text-black/40">
              Arrastra una foto para cambiar el orden — es el mismo orden en que
              aparecen en el carrusel del home.
            </p>
            {reordering && (
              <p className="font-body text-xs text-black/40">Guardando orden…</p>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative h-28 w-28 cursor-grab active:cursor-grabbing ${
                  draggedIndex === index ? "opacity-40" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.imageUrl}
                  alt=""
                  draggable={false}
                  className="h-28 w-28 rounded-lg border-2 border-brand-black object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleDelete(image.id)}
                  disabled={deletingId === image.id}
                  aria-label="Quitar del carrusel"
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-brand-black bg-white text-xs font-bold leading-none disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card-pop max-w-lg p-6">
        <h2 className="mb-4 font-heading text-sm font-bold">Agregar foto al carrusel</h2>

        <ImagesField
          images={newImages}
          onChange={setNewImages}
          onUploadingChange={setUploading}
          multiple={false}
        />

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={handleAdd}
          disabled={saving || uploading || newImages.length === 0}
          className="btn-pop btn-pop-primary mt-4 px-6 py-2 text-sm disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Agregar al carrusel"}
        </button>
      </div>
    </div>
  );
}
