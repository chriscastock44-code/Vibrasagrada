"use client";

import { useEffect, useRef } from "react";
import type { CustomDesignImage } from "@/lib/types";

// Carrusel "sin fin" pero manual: el usuario arrastra o hace scroll con el
// mouse/touch/trackpad, o usa las flechas (que avanzan de 4 en 4). Al llegar
// a cualquiera de los dos extremos salta de vuelta al principio (o al
// final) sin que se note — la lista de fotos está triplicada, así que el
// "salto" ocurre siempre entre dos copias idénticas.
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
    // tener margen para seguir moviéndose hacia cualquier lado desde el
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

  // Avanza/retrocede 4 fotos con las flechas. El ancho de "una foto" se mide
  // en el momento (foto + su gap), en vez de asumir un valor fijo, porque
  // las tarjetas cambian de tamaño según el ancho de pantalla (w-56 / sm:w-72).
  function scrollByCards(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = el.children;
    if (cards.length < 2) return;
    const first = cards[0] as HTMLElement;
    const second = cards[1] as HTMLElement;
    const step = second.offsetLeft - first.offsetLeft;
    el.scrollBy({ left: direction * step * 4, behavior: "smooth" });
  }

  if (images.length === 0) return null;

  return (
    <div className="relative px-2 sm:px-4">
      <button
        type="button"
        onClick={() => scrollByCards(-1)}
        aria-label="Ver diseños anteriores"
        className="btn-pop absolute top-1/2 left-0 z-10 h-10 w-10 -translate-y-1/2 justify-center bg-white hover:bg-brand-yellow sm:h-12 sm:w-12"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div
        ref={scrollerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="flex cursor-grab select-none gap-4 overflow-x-auto px-12 [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
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

      <button
        type="button"
        onClick={() => scrollByCards(1)}
        aria-label="Ver más diseños"
        className="btn-pop absolute top-1/2 right-0 z-10 h-10 w-10 -translate-y-1/2 justify-center bg-white hover:bg-brand-yellow sm:h-12 sm:w-12"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
