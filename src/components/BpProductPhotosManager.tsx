"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BpProductPhoto } from "@/lib/types";
import ImagesField from "./ImagesField";

function moveItem<T>(list: T[], from: number, to: number): T[] {
  const copy = list.slice();
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);
  return copy;
}

// Administra el carrusel de "Productos ya hechos" de la landing de Barks &
// Paws — mismo patrón de arrastrar-y-soltar que el carrusel de Diseños
// personalizados de Vibra Sagrada, pero con un texto opcional (caption) por
// foto, ya que aquí sí tiene sentido decir qué es cada producto.
export default function BpProductPhotosManager({
  initialPhotos,
}: {
  initialPhotos: BpProductPhoto[];
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initialPhotos);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newCaption, setNewCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setPhotos((prev) => moveItem(prev, draggedIndex, index));
    setDraggedIndex(index);
  }

  async function handleDragEnd() {
    setDraggedIndex(null);
    setReordering(true);
    try {
      await fetch("/api/admin/reorder-bp-product-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: photos.map((p) => p.id) }),
      });
      router.refresh();
    } finally {
      setReordering(false);
    }
  }

  async function handleAdd() {
    if (newImages.length === 0) {
      setError("Sube o pega primero la foto que quieres agregar.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/bp-product-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: newImages[0],
          caption: newCaption,
          sortOrder: photos.length,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo agregar la foto.");
        return;
      }
      setPhotos((prev) => [...prev, data.photo]);
      setNewImages([]);
      setNewCaption("");
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
      await fetch(`/api/bp-product-photos/${id}`, { method: "DELETE" });
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {photos.length > 0 && (
        <div>
          <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="font-heading text-sm font-bold">
              Fotos actuales en el carrusel ({photos.length})
            </h2>
            <p className="font-body text-xs text-black/40">
              Arrastra una foto para cambiar el orden.
            </p>
            {reordering && (
              <p className="font-body text-xs text-black/40">Guardando orden…</p>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative w-28 cursor-grab active:cursor-grabbing ${
                  draggedIndex === index ? "opacity-40" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.imageUrl}
                  alt=""
                  draggable={false}
                  className="h-28 w-28 rounded-lg border-2 border-brand-black object-cover"
                />
                {photo.caption && (
                  <p className="mt-1 truncate font-body text-xs text-black/60" title={photo.caption}>
                    {photo.caption}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  disabled={deletingId === photo.id}
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

        <div className="mt-4">
          <label className="mb-1 block font-body text-sm font-semibold">
            Descripción (opcional)
          </label>
          <input
            type="text"
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
            placeholder='Ej: "Tag grabado para Firulais"'
            className="w-full rounded-lg border-2 border-brand-black bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          />
        </div>

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
