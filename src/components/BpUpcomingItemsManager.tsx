"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BpUpcomingItem } from "@/lib/types";
import ImagesField from "./ImagesField";

function moveItem<T>(list: T[], from: number, to: number): T[] {
  const copy = list.slice();
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);
  return copy;
}

function EditItemForm({
  item,
  onCancel,
  onSaved,
}: {
  item: BpUpcomingItem;
  onCancel: () => void;
  onSaved: (item: BpUpcomingItem) => void;
}) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>(item.imageUrl ? [item.imageUrl] : []);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!title.trim()) {
      setError("Ponle un título a la tarjeta.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/bp-upcoming-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: images[0] || "",
          title,
          description,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar.");
        return;
      }
      onSaved({ ...item, imageUrl: images[0] || "", title, description });
      router.refresh();
    } catch {
      setError("Ocurrió un error de red.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card-pop w-full max-w-sm p-5">
      <ImagesField
        images={images}
        onChange={setImages}
        onUploadingChange={setUploading}
        multiple={false}
      />

      <div className="mt-4">
        <label className="mb-1 block font-body text-sm font-semibold">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border-2 border-brand-black bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
        />
      </div>

      <div className="mt-3">
        <label className="mb-1 block font-body text-sm font-semibold">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-lg border-2 border-brand-black bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading}
          className="btn-pop btn-pop-primary px-5 py-2 text-sm disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="btn-pop btn-pop-outline bg-white px-5 py-2 text-sm"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// Administra las tarjetas de "Lo que viene" de la landing de Barks & Paws —
// cada una con su propia foto, título y descripción (a diferencia del
// carrusel de fotos simple de "Productos ya hechos"), más el mismo
// arrastrar-y-soltar para reordenar que ya se usa en el resto del admin.
export default function BpUpcomingItemsManager({
  initialItems,
}: {
  initialItems: BpUpcomingItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const [newImages, setNewImages] = useState<string[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newUploading, setNewUploading] = useState(false);
  const [newError, setNewError] = useState<string | null>(null);

  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setItems((prev) => moveItem(prev, draggedIndex, index));
    setDraggedIndex(index);
  }

  async function handleDragEnd() {
    setDraggedIndex(null);
    setReordering(true);
    try {
      await fetch("/api/admin/reorder-bp-upcoming-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: items.map((it) => it.id) }),
      });
      router.refresh();
    } finally {
      setReordering(false);
    }
  }

  async function handleAdd() {
    if (!newTitle.trim()) {
      setNewError("Ponle un título a la tarjeta.");
      return;
    }
    setNewError(null);
    setAdding(true);
    try {
      const res = await fetch("/api/bp-upcoming-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: newImages[0] || "",
          title: newTitle,
          description: newDescription,
          sortOrder: items.length,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNewError(data.error || "No se pudo agregar la tarjeta.");
        return;
      }
      setItems((prev) => [...prev, data.item]);
      setNewImages([]);
      setNewTitle("");
      setNewDescription("");
      router.refresh();
    } catch {
      setNewError("Ocurrió un error de red.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await fetch(`/api/bp-upcoming-items/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((it) => it.id !== id));
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {items.length > 0 && (
        <div>
          <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="font-heading text-sm font-bold">
              Tarjetas actuales ({items.length})
            </h2>
            <p className="font-body text-xs text-black/40">
              Arrastra una tarjeta para cambiar el orden.
            </p>
            {reordering && (
              <p className="font-body text-xs text-black/40">Guardando orden…</p>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            {items.map((item, index) =>
              editingId === item.id ? (
                <EditItemForm
                  key={item.id}
                  item={item}
                  onCancel={() => setEditingId(null)}
                  onSaved={(updated) => {
                    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
                    setEditingId(null);
                  }}
                />
              ) : (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`card-pop w-56 cursor-grab overflow-hidden active:cursor-grabbing ${
                    draggedIndex === index ? "opacity-40" : ""
                  }`}
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      draggable={false}
                      className="h-32 w-full border-b-2 border-brand-black object-cover"
                    />
                  ) : (
                    <div className="flex h-32 w-full items-center justify-center border-b-2 border-brand-black bg-brand-cream text-xs text-black/30">
                      Sin imagen
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-heading text-sm font-bold">{item.title}</h3>
                    {item.description && (
                      <p className="mt-1 line-clamp-2 font-body text-xs text-black/55">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(item.id)}
                        className="rounded-full border-2 border-brand-black bg-white px-3 py-1 font-body text-xs font-semibold hover:bg-brand-yellow"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="rounded-full border-2 border-brand-black bg-white px-3 py-1 font-body text-xs font-semibold hover:bg-red-100 disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      <div className="card-pop max-w-sm p-6">
        <h2 className="mb-4 font-heading text-sm font-bold">Agregar tarjeta</h2>

        <ImagesField
          images={newImages}
          onChange={setNewImages}
          onUploadingChange={setNewUploading}
          multiple={false}
        />

        <div className="mt-4">
          <label className="mb-1 block font-body text-sm font-semibold">Título</label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Ej: Tags"
            className="w-full rounded-lg border-2 border-brand-black bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          />
        </div>

        <div className="mt-3">
          <label className="mb-1 block font-body text-sm font-semibold">Descripción</label>
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            rows={2}
            placeholder="Ej: Placas personalizadas para el collar"
            className="w-full rounded-lg border-2 border-brand-black bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          />
        </div>

        {newError && <p className="mt-3 text-sm text-red-600">{newError}</p>}

        <button
          type="button"
          onClick={handleAdd}
          disabled={adding || newUploading || !newTitle.trim()}
          className="btn-pop btn-pop-primary mt-4 px-6 py-2 text-sm disabled:opacity-50"
        >
          {adding ? "Guardando…" : "Agregar tarjeta"}
        </button>
      </div>
    </div>
  );
}
