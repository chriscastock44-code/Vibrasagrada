"use client";

import { useEffect, useState } from "react";
import { useCloudinaryUpload } from "@/lib/useCloudinaryUpload";

export default function ImagesField({
  images,
  onChange,
  onUploadingChange,
  multiple = true,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  multiple?: boolean;
}) {
  const { uploading, uploadError, uploadFiles } = useCloudinaryUpload();
  const [manualUrl, setManualUrl] = useState("");

  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [uploading, onUploadingChange]);

  async function handleFilesSelected(files: File[]) {
    const uploaded = await uploadFiles(files);
    if (uploaded.length > 0) {
      onChange(multiple ? [...images, ...uploaded] : [uploaded[0]]);
    }
  }

  function handleAddManualUrl() {
    const url = manualUrl.trim();
    if (!url) return;
    onChange(multiple ? [...images, url] : [url]);
    setManualUrl("");
  }

  function handleRemoveImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
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
          multiple={multiple}
          disabled={uploading}
          onChange={(e) => {
            // Importante: copiar a un arreglo normal ANTES de limpiar el
            // campo. e.target.files es una lista "viva" ligada al input —
            // si se limpia el input (e.target.value = "") antes de que
            // termine de leerse, esa misma lista se vacía también, aunque
            // ya se le haya pasado como argumento a otra función.
            const selectedFiles = Array.from(e.target.files || []);
            e.target.value = "";
            handleFilesSelected(selectedFiles);
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
  );
}
