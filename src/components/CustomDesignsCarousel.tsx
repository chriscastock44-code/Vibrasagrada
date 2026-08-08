"use client";

import { useEffect, useRef } from "react";
import type { CustomDesignImage } from "@/lib/types";

// Carrusel "sin fin" pero manual: el usuario arrastra o hace scroll con el
// mouse/touch/trackpad, y cuando llega a cualquiera de los dos extremos
// salta de vuelta al principio (o al final) sin que se note — la lista de
// fotos está triplicada, así que el "salto" ocurre siempre entre dos copias
// idénticas.
export default function CustomDesignsCarousel({ images }: { images: CustomDesignImage[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  const track = [...images, ...images, ...images];

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || images.length === 0) return;

    // Arranca parado en el segundo bloque de fotos (el del medio), para
    // tener margen para seguir arrastrando hacia cualquier lado desde el
    // primer segundo, sin llegar todavía a una orilla real.
    const setWidth = el.scrollWidth / 3;
    el.scrollLeft = setWidth;

    function handleScroll() {
      if (!el) return;
      const setW = el.scrollWidth / 3;
      if (el.scrollLeft < setW * 0.5) {
        el.scrollLeft += setW;
      } else if (el.scrollLeft > setW * 1.5) {
        el.scrollLeft -= setW;
      }
    }

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [images.length]);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // El touch ya hace scroll nativo solo (más suave que si lo manejamos a
    // mano) — este arrastre con el mouse es solo para desktop.
    if (e.pointerType !== "mouse") return;
    const el = scrollerRef.current;
    if (!el) return;
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragStartScroll.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollLeft = dragStartScroll.current - (e.clientX - dragStartX.current);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = false;
    scrollerRef.current?.releasePointerCapture(e.pointerId);
  }

  if (images.length === 0) return null;

  return (
    <div
      ref={scrollerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="flex cursor-grab select-none gap-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
    >
      {track.map((image, index) => (
        <div
          key={`${image.id}-${index}`}
          className="card-pop aspect-square w-56 shrink-0 overflow-hidden sm:w-72"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.imageUrl}
            alt=""
            draggable={false}
            className="h-full w-full rounded-[calc(1rem-2px)] object-cover"
          />
        </div>
      ))}
    </div>
  );
}
