import type { ReactNode } from "react";
import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import type { ProductCategory } from "@/lib/types";

export const metadata = {
  title: "Tienda — Vibra Sagrada",
};

// Products are managed through /admin and can change at any time, so this
// page must not be cached as static HTML at build time.
export const dynamic = "force-dynamic";

const CATEGORIES: {
  value: ProductCategory;
  label: string;
  icon: ReactNode;
  // Color sólido del brandbook, distinto por categoría.
  cardClassName: string;
  // Color del ícono y el texto sobre el fondo de esa categoría.
  contentClassName: string;
}[] = [
  {
    value: "tote",
    label: "Totes",
    cardClassName: "bg-brand-blue",
    contentClassName: "text-black",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-12 w-12"
        aria-hidden="true"
      >
        <path d="M5 8.5h14l1 12.5H4l1-12.5z" />
        <path d="M8.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5" />
      </svg>
    ),
  },
  {
    value: "playera",
    label: "Playeras",
    cardClassName: "bg-brand-pink",
    contentClassName: "text-white",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-12 w-12"
        aria-hidden="true"
      >
        <path d="M8 4L3 7.5l2.5 3.5L8 9.5V21h8V9.5l2.5 1.5L21 7.5 16 4l-2 2h-4l-2-2z" />
      </svg>
    ),
  },
];

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const allProducts = await getAllProducts({ onlyActive: true });

  // Sin categoría en la URL: pantalla de elección (Totes / Playeras) en vez
  // de tirar todos los productos de un jalón.
  if (!categoria) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h1 className="text-3xl font-extrabold">Tienda</h1>
        <p className="mt-2 font-body text-black/60">¿Qué estás buscando?</p>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={`/tienda?categoria=${cat.value}`}
              className={`card-pop relative flex flex-col items-center gap-4 overflow-hidden px-4 py-14 transition hover:-translate-y-1 sm:px-8 [container-type:inline-size] ${cat.cardClassName}`}
            >
              <div
                className={`relative z-10 flex flex-col items-center gap-4 ${cat.contentClassName}`}
              >
                {cat.icon}
                {/* El tamaño se calcula con unidades "cqw" — relativas al
                    ancho real de LA TARJETA, no de la pantalla. Así nunca se
                    desborda, sin importar si hay 1 o 2 columnas ni qué tan
                    angosto sea el navegador (a diferencia de "vw", que solo
                    mira el ancho de la ventana completa). */}
                <span className="text-balance font-heading text-[clamp(1.1rem,11cqw,2.5rem)] leading-tight font-bold">
                  {cat.label}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/tienda?categoria=todos"
          className="mt-10 inline-block font-body text-sm font-semibold underline decoration-2 underline-offset-4 hover:text-brand-navy"
        >
          Ver todos los productos
        </Link>
      </div>
    );
  }

  const products =
    categoria === "todos"
      ? allProducts
      : allProducts.filter((product) => product.category === categoria);
  const categoryLabel = CATEGORIES.find((c) => c.value === categoria)?.label;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Link
        href="/tienda"
        className="mb-6 inline-flex items-center gap-1 font-body text-sm font-semibold underline decoration-2 underline-offset-4 hover:text-brand-navy"
      >
        ‹ Todas las categorías
      </Link>

      <h1 className="text-3xl font-extrabold">{categoryLabel || "Todos los productos"}</h1>
      <p className="mt-2 font-body text-black/60">Cada pieza es una edición 1 de 1.</p>

      {products.length === 0 ? (
        <p className="mt-12 text-black/50">
          Todavía no hay productos publicados en esta categoría.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link key={product.id} href={`/tienda/${product.slug}`} className="group block">
              <div className="card-pop w-full overflow-hidden">
                {product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-auto w-full rounded-[calc(1rem-2px)] transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center rounded-[calc(1rem-2px)] bg-brand-cream text-xs text-black/30">
                    Sin imagen
                  </div>
                )}
              </div>
              <h3 className="mt-4 font-heading text-sm font-bold">{product.name}</h3>
              <p className="font-body text-sm text-black/60">
                {formatPrice(product.priceCents, product.currency)}
              </p>
              {product.stock <= 0 && (
                <p className="tag-pop mt-1 bg-brand-pink text-[10px]">Agotado</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
