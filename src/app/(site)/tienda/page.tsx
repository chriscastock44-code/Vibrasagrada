import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";

export const metadata = {
  title: "Tienda — Vobra Sagrada",
};

// Products are managed through /admin and can change at any time, so this
// page must not be cached as static HTML at build time.
export const dynamic = "force-dynamic";

export default function StorePage() {
  const products = getAllProducts({ onlyActive: true });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Tienda</h1>
      <p className="mt-2 text-black/60">
        Cada producto se personaliza especialmente para ti.
      </p>

      {products.length === 0 ? (
        <p className="mt-12 text-black/50">
          Aún no hay productos publicados. Agrega productos desde el panel de
          administración en <code>/admin</code>.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link key={product.id} href={`/tienda/${product.slug}`} className="group block">
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-black/5">
                {product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-black/30">
                    Sin imagen
                  </div>
                )}
              </div>
              <h3 className="mt-4 text-sm font-medium">{product.name}</h3>
              <p className="text-sm text-black/60">
                {formatPrice(product.priceCents, product.currency)}
              </p>
              {product.stock <= 0 && (
                <p className="mt-1 text-xs text-red-600">Agotado</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
