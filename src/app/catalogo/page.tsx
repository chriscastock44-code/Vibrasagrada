import Image from "next/image";
import { getAllProducts } from "@/lib/products";
import CatalogGrid from "@/components/CatalogGrid";

// Productos marcados para el catálogo (checkbox en /admin/catalogo), sin
// importar si siguen activos en la tienda — a propósito NO se filtra por
// "active" aquí: hay piezas que ya se vendieron por fuera (por eso están
// ocultas de /tienda) pero que igual se quieren mostrar en este catálogo,
// así que el checkbox de /admin/catalogo manda solo, sin condición extra.
export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const allProducts = await getAllProducts();
  const products = allProducts.filter((product) => product.showInCatalog);

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
        <CatalogGrid products={products} />
      ) : (
        <p className="mx-auto max-w-md px-6 pb-20 text-center font-body text-sm text-black/50">
          Todavía no hay productos marcados para el catálogo. Márcalos desde
          /admin/catalogo.
        </p>
      )}

      <footer className="border-t-2 border-brand-black py-6 text-center font-body text-[11px] text-black/45">
        Documento de uso privado — no distribuir públicamente · © {new Date().getFullYear()}{" "}
        Vibra Sagrada
      </footer>
    </div>
  );
}
