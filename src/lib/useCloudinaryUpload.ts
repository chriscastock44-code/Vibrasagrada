"use client";

import { useState } from "react";

/**
 * Sube archivos directo a Cloudinary desde el navegador (sin pasar por
 * nuestro servidor). Comparte esta lógica ProductForm y el admin de
 * Instagram, para no duplicar dos veces el mismo código (y el mismo riesgo
 * de bugs, como el de la FileList "viva" que ya se corrigió aquí una vez).
 */
export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function uploadFiles(files: File[]): Promise<string[]> {
    if (!files || files.length === 0) return [];
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
        return [];
      }

      const uploadedUrls: string[] = [];
      for (const file of files) {
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
      return uploadedUrls;
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
      return [];
    } finally {
      setUploading(false);
    }
  }

  return { uploading, uploadError, uploadFiles };
}
