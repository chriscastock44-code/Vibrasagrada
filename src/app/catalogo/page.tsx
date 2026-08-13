import Image from "next/image";
import { getAllProducts } from "@/lib/products";
import type { ProductCategory } from "@/lib/types";

// Productos activos, en el mismo orden manual que ya se usa en /tienda —
// se jalan directo de la base de datos así que el catálogo siempre está al
// día con lo que haya cargado en /admin, sin mantenimiento aparte.
export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  tote: "Tote bag",
  playera: "Playera",
};

export default async function CatalogoPage() {
  const products = await getAllProducts({ onlyActive: true });

  return (
    <div>
      {/* Header propio y minimalista (sin nav de Tienda/Carrito): este
          documento es solo para ver, no para comprar. */}
      <header className="border-b-2 border-brand-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-4">
          <div className="flex min-w-0 shrink items-center gap-2">
            <Image
              src="/brand/icon.png"
              alt=""
              width={40}
              height={28}
              className="h-7 w-auto shrink-0"
            />
            {/* Igual que en el Header del sitio: el wordmark completo no
                cabe junto al badge en mobile, así que ahí se queda solo el
                ícono (ver AGENTS.md sobre no encimar elementos en mobile). */}
            <Image
              src="/brand/wordmark.png"
              alt="Vibra Sagrada"
              width={762}
              height={79}
              className="hidden h-4 w-auto sm:block"
            />
          </div>
          <span className="tag-pop shrink-0 bg-white text-[10px] sm:text-xs">
            ✦ Catálogo privado
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 pt-16 pb-12 text-center">
        <h1 className="font-heading text-4xl font-extrabold text-black sm:text-5xl">Catálogo</h1>
        <p className="mx-auto mt-4 max-w-md text-balance font-body text-black/65">
          Piezas con historia, no con etiqueta. Una selección completa de nuestras tote bags y
          playeras, para verlas todas en un solo lugar.
        </p>
      </div>

      {products.length > 0 ? (
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 pb-20 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="card-pop overflow-hidden text-left">
              {product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="aspect-square w-full border-b-2 border-brand-black object-cover"
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
      ) : (
        <p className="mx-auto max-w-md px-6 pb-20 text-center font-body text-sm text-black/50">
          Todavía no hay productos activos cargados en la tienda.
        </p>
      )}

      <footer className="border-t-2 border-brand-black py-6 text-center font-body text-[11px] text-black/45">
        Documento de uso privado — no distribuir públicamente · © {new Date().getFullYear()}{" "}
        Vibra Sagrada
      </footer>
    </div>
  );
}
