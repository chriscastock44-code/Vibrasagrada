"use client";

import { useEffect, useState } from "react";

// Galería de fotos del producto: una foto principal (agrandable a pantalla
// completa) + miniaturas abajo para elegir cuál se muestra — antes solo se
// veía siempre images[0], aunque el admin hubiera subido varias.
export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") {
        setActiveIndex((i) => (i + 1) % images.length);
      }
      if (e.key === "ArrowLeft") {
        setActiveIndex((i) => (i - 1 + images.length) % images.length);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, images.length]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-[calc(1rem-2px)] bg-brand-cream text-xs text-black/30">
        Sin imagen
      </div>
    );
  }

  return (
    <div>
      <div className="card-pop w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[activeIndex]}
          alt={alt}
          className="h-auto w-full cursor-zoom-in rounded-[calc(1rem-2px)]"
          onClick={() => setLightboxOpen(true)}
        />
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver foto ${index + 1} de ${images.length}`}
              aria-current={index === activeIndex}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                index === activeIndex
                  ? "border-brand-navy"
                  : "border-brand-black/20 hover:border-brand-black"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 text-3xl leading-none text-white hover:text-brand-yellow"
            aria-label="Cerrar"
          >
            ×
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i - 1 + images.length) % images.length);
                }}
                aria-label="Foto anterior"
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-4xl leading-none text-white hover:text-brand-yellow sm:left-4"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i + 1) % images.length);
                }}
                aria-label="Foto siguiente"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-4xl leading-none text-white hover:text-brand-yellow sm:right-4"
              >
                ›
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeIndex]}
            alt={alt}
            className="max-h-full max-w-full cursor-default object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
