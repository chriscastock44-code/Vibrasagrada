import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import ParallaxLayer from "@/components/ParallaxLayer";

// Products are managed through /admin and can change at any time, so this
// page must not be cached as static HTML at build time.
export const dynamic = "force-dynamic";

export default function HomePage() {
  const featured = getAllProducts({ onlyActive: true }).slice(0, 3);

  return (
    <div>
      {/* HERO — contenido de marcador de posición, listo para dirección de diseño.
          El efecto parallax es real (dos capas a distinta velocidad); el
          wordmark gigante de fondo es un placeholder fácil de cambiar por
          una foto o ilustración real de marca — ver ParallaxLayer más abajo. */}
      <section className="relative overflow-hidden">
        <ParallaxLayer
          speed={0.12}
          className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
        >
          <span className="select-none text-[32vw] font-semibold leading-none tracking-tighter text-black/[0.035] sm:text-[22vw]">
            VS
          </span>
        </ParallaxLayer>
        <ParallaxLayer
          speed={0.3}
          className="pointer-events-none absolute -top-24 right-[-10%] -z-10 h-72 w-72 rounded-full bg-black/[0.03] blur-3xl sm:h-96 sm:w-96"
        >
          <span />
        </ParallaxLayer>

        <div className="mx-auto max-w-6xl px-6 py-24 text-center sm:py-32">
          <p className="mb-4 text-xs tracking-[0.3em] uppercase text-black/50">
            Una marca con alma
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Vobra Sagrada
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-black/60">
            Productos 100% personalizados, hechos con un alma y una razón de ser.
            {/* TODO: reemplazar con la propuesta de valor real de la marca */}
          </p>
          <div className="mt-10">
            <Link
              href="/tienda"
              className="inline-block rounded-full bg-black px-8 py-3 text-sm text-white transition hover:opacity-80"
            >
              Ver la tienda
            </Link>
          </div>
        </div>
      </section>

      {/* HISTORIA DE MARCA — placeholder, con una segunda capa parallax sutil */}
      <section className="relative overflow-hidden border-y border-black/10 bg-black/[0.02]">
        <ParallaxLayer
          speed={0.18}
          className="pointer-events-none absolute left-[-8%] top-1/2 -z-10 h-64 w-64 -translate-y-1/2 rounded-full bg-black/[0.04] blur-3xl"
        >
          <span />
        </ParallaxLayer>

        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold">Nuestra historia</h2>
          <p className="mt-4 text-black/60">
            {/* TODO: contar la historia real de Vobra Sagrada — origen, misión, qué hace único a cada producto */}
            Cada pieza de Vobra Sagrada se crea a mano, pensada especialmente
            para quien la recibe. Creemos que los objetos con significado
            perduran más que cualquier otra cosa.
          </p>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Destacados</h2>
          <Link href="/tienda" className="text-sm underline hover:opacity-70">
            Ver todo
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="text-black/50">
            Aún no hay productos publicados. Agrega productos desde el panel
            de administración en <code>/admin</code>.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <Link
                key={product.id}
                href={`/tienda/${product.slug}`}
                className="group block"
              >
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
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
