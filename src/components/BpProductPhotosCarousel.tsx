"use client";

import { useEffect, useRef } from "react";
import type { BpProductPhoto } from "@/lib/types";

// Carrusel "sin fin" de fotos de productos ya hechos, para la landing de
// Barks & Paws — mismo mecanismo que CustomDesignsCarousel (arrastrar/
// scroll/flechas, con salto invisible entre copias triplicadas de la
// lista), aquí como su propio componente porque además muestra un texto
// (caption) opcional debajo de cada foto.
export default function BpProductPhotosCarousel({ photos }: { photos: BpProductPhoto[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  const track = [...photos, ...photos, ...photos];

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || photos.length === 0) return;

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
  }, [photos.length]);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
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

  if (photos.length === 0) return null;

  return (
    <div className="relative px-2 sm:px-4">
      <button
        type="button"
        onClick={() => scrollByCards(-1)}
        aria-label="Ver productos anteriores"
        className="btn-pop absolute top-1/2 left-0 z-10 h-10 w-10 -translate-y-1/2 justify-center bg-white hover:bg-brand-bp-teal sm:h-12 sm:w-12"
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
        {track.map((photo, index) => (
          <div key={`${photo.id}-${index}`} className="w-56 shrink-0 sm:w-72">
            <div className="card-pop aspect-square overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.imageUrl}
                alt={photo.caption || ""}
                draggable={false}
                className="h-full w-full rounded-[calc(1rem-2px)] object-cover"
              />
            </div>
            {photo.caption && (
              <p className="mt-2 truncate text-center font-body text-xs font-medium text-black/60">
                {photo.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollByCards(1)}
        aria-label="Ver más productos"
        className="btn-pop absolute top-1/2 right-0 z-10 h-10 w-10 -translate-y-1/2 justify-center bg-white hover:bg-brand-bp-teal sm:h-12 sm:w-12"
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
