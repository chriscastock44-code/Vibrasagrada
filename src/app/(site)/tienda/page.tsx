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

// TODO: Chris va a pasar el link real de WhatsApp para "Diseños
// personalizados" — en cuanto lo tenga, reemplazar este marcador.
const WHATSAPP_LINK = "https://wa.me/52XXXXXXXXXX";

const CATEGORIES: {
  value: ProductCategory;
  label: string;
  icon: ReactNode;
  // Fondo con un patrón real del brandbook, distinto por categoría.
  cardClassName: string;
  // Color + sombra difuminada para que el ícono y el texto resalten sobre
  // el patrón (que es bastante ocupado/colorido).
  contentClassName: string;
}[] = [
  {
    value: "tote",
    label: "Totes",
    cardClassName: "pattern-lunar",
    contentClassName: "text-black drop-shadow-[0_3px_10px_rgba(0,0,0,0.5)]",
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
    cardClassName: "pattern-raya",
    contentClassName: "text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.6)]",
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

// No es una categoría de producto — es un botón que manda directo a
// WhatsApp para pedir un diseño personalizado. Por eso usa fondo sólido
// amarillo (el mismo color de los botones de "acción" del sitio) en vez de
// un patrón, para que se lea distinto a "explorar" Totes/Playeras.
const CUSTOM_DESIGN_CTA = {
  label: "Diseños personalizados",
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
      <path d="M14.5 3.5l6 6L7 23H1v-6L14.5 3.5z" />
      <path d="M12.5 5.5l6 6" />
    </svg>
  ),
};

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

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={`/tienda?categoria=${cat.value}`}
              className="card-pop relative flex flex-col items-center gap-4 overflow-hidden px-8 py-14 transition hover:-translate-y-1"
            >
              {/* Patrón al 80% de opacidad sobre el fondo blanco de card-pop
                  — se ve un poco más suave que el patrón a color completo. */}
              <div className={`absolute inset-0 ${cat.cardClassName} opacity-80`} />
              <div
                className={`relative z-10 flex flex-col items-center gap-4 ${cat.contentClassName}`}
              >
                {cat.icon}
                <span className="font-heading text-[2.5rem] leading-tight font-bold">
                  {cat.label}
                </span>
              </div>
            </Link>
          ))}

          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="card-pop relative flex flex-col items-center gap-4 overflow-hidden bg-brand-yellow px-8 py-14 transition hover:-translate-y-1"
          >
            <div className="relative z-10 flex flex-col items-center gap-4 text-black drop-shadow-[0_3px_10px_rgba(0,0,0,0.25)]">
              {CUSTOM_DESIGN_CTA.icon}
              <span className="font-heading text-[2.5rem] leading-tight font-bold">
                {CUSTOM_DESIGN_CTA.label}
              </span>
            </div>
          </a>
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
