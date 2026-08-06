"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { InstagramPost } from "@/lib/types";
import ImagesField from "./ImagesField";

export default function InstagramPostsManager({
  initialPosts,
}: {
  initialPosts: InstagramPost[];
}) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [link, setLink] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleAdd() {
    if (newImages.length === 0) {
      setError("Sube o pega primero la imagen que quieres agregar.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/instagram-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: newImages[0], link, sortOrder: posts.length }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo agregar la imagen.");
        return;
      }
      setPosts((prev) => [...prev, data.post]);
      setNewImages([]);
      setLink("");
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
      await fetch(`/api/instagram-posts/${id}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {posts.length > 0 && (
        <div>
          <h2 className="mb-3 font-heading text-sm font-bold">
            Fotos actuales en el carrusel ({posts.length})
          </h2>
          <div className="flex flex-wrap gap-4">
            {posts.map((post) => (
              <div key={post.id} className="relative h-28 w-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.imageUrl}
                  alt=""
                  className="h-28 w-28 rounded-lg border-2 border-brand-black object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleDelete(post.id)}
                  disabled={deletingId === post.id}
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
            Link del post (opcional)
          </label>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://instagram.com/p/..."
            className="w-full rounded-lg border-2 border-brand-black bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          />
          <p className="mt-1 font-body text-xs text-black/50">
            Si lo dejas vacío, la foto va a llevar a tu perfil de Instagram.
          </p>
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
