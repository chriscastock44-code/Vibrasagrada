"use client";

import { useEffect, useState } from "react";
import type { Product, ProductCategory } from "@/lib/types";

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  tote: "Tote bag",
  playera: "Playera",
};

// Grid del catálogo público con lightbox: click en la foto la agranda a
// pantalla completa (click de nuevo, la X, la tecla Escape, o click fuera
// de la imagen la cierran). Es un componente aparte (con "use client")
// solo por este estado de la imagen abierta — el resto de /catalogo sigue
// siendo un server component normal.
export default function CatalogGrid({ products }: { products: Product[] }) {
  const [openImage, setOpenImage] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    if (!openImage) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenImage(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openImage]);

  return (
    <>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 pb-20 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="card-pop overflow-hidden text-left">
            {product.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0]}
                alt={product.name}
                onClick={() => setOpenImage({ src: product.images[0], alt: product.name })}
                className="aspect-square w-full cursor-zoom-in border-b-2 border-brand-black object-cover transition hover:opacity-90"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center border-b-2 border-brand-black bg-brand-cream text-xs text-black/30">
                Sin imagen
              </div>
            )}
            <div className="px-4 py-3">
              <h3 className="font-heading text-sm font-bold text-black">{product.name}</h3>
              <p className="text-[11px] font-semibold tracking-wide text-black/45 uppercase">
                {CATEGORY_LABEL[product.category]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {openImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={openImage.alt}
          onClick={() => setOpenImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-10"
        >
          <button
            type="button"
            onClick={() => setOpenImage(null)}
            aria-label="Cerrar"
            className="btn-pop absolute top-4 right-4 h-10 w-10 justify-center bg-white text-lg sm:top-6 sm:right-6"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={openImage.src}
            alt={openImage.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full cursor-zoom-out rounded-2xl border-2 border-white object-contain"
          />
        </div>
      )}
    </>
  );
}
