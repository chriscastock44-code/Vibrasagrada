import Image from "next/image";
import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import { getAllCustomDesignImages } from "@/lib/customDesignImages";
import { formatPrice } from "@/lib/format";
import ParallaxLayer from "@/components/ParallaxLayer";
import CustomDesignsCarousel from "@/components/CustomDesignsCarousel";

// Los productos se gestionan desde /admin y pueden cambiar en cualquier
// momento, así que esta página no debe quedar cacheada como HTML estático
// en build.
export const dynamic = "force-dynamic";

const VALUE_TAGS = ["Reutilizable", "Hecho a pedido", "Diseño autoral", "Durable"];

// CTA de "Diseños personalizados" en el home — manda directo a WhatsApp,
// no a un formulario ni a la tienda.
const WHATSAPP_LINK = "https://wa.me/529848040610";

export default async function HomePage() {
  // Destacados los elige la marca a mano desde /admin (checkbox "Mostrar en
  // Destacados"), no son automáticamente los últimos productos creados.
  const featured = await getFeaturedProducts();
  const customDesignImages = await getAllCustomDesignImages();

  return (
    <div>
      {/* HERO — logotipo real de marca + copy tomado del brandbook (tono de
          voz, sección "Decimos"). El efecto parallax mueve el bloque de
          patrón "Raya Sagrada" a distinta velocidad que el logo. */}
      <section className="pattern-lunar relative overflow-hidden border-b-2 border-brand-black py-2" />
      <section className="relative overflow-hidden">
        <ParallaxLayer
          speed={0.28}
          className="pointer-events-none absolute -right-16 top-10 -z-10 h-40 w-40 -rotate-6 border-2 border-brand-black sm:h-56 sm:w-56"
          style={{
            backgroundColor: "var(--brand-navy)",
            backgroundImage:
              "repeating-linear-gradient(45deg, var(--brand-pink) 0px, var(--brand-pink) 8px, var(--brand-navy) 8px, var(--brand-navy) 16px)",
          }}
        >
          <span />
        </ParallaxLayer>
        <ParallaxLayer
          speed={0.16}
          className="pointer-events-none absolute -left-10 bottom-6 -z-10 h-28 w-28 rotate-12 rounded-full border-2 border-brand-black sm:h-40 sm:w-40"
          style={{
            backgroundColor: "var(--brand-blue)",
            backgroundImage: "radial-gradient(var(--brand-yellow) 22%, transparent 23%)",
            backgroundSize: "16px 16px",
          }}
        >
          <span />
        </ParallaxLayer>

        <div className="mx-auto max-w-6xl px-6 py-20 text-center sm:py-28">
          <p className="mb-6 font-body text-xs font-semibold tracking-[0.3em] text-brand-navy uppercase">
            Piezas con historia
            <br />
            no con etiqueta
          </p>
          <Image
            src="/brand/logo.png"
            alt="Vibra Sagrada"
            width={520}
            height={274}
            priority
            className="mx-auto h-auto w-64 sm:w-80"
          />
          <p className="mx-auto mt-8 max-w-xl text-balance font-body text-black/70">
            Cuéntanos tu historia y la convertimos en una pieza que no vas a
            querer quitarte.
          </p>
          <div className="mt-10">
            <Link href="/tienda" className="btn-pop btn-pop-primary px-8 py-3 text-sm">
              Ver la tienda
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {VALUE_TAGS.map((tag) => (
              <span key={tag} className="tag-pop bg-white">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* HISTORIA DE MARCA — copy real del brandbook (sección "Esencia de marca") */}
      <section className="relative overflow-hidden bg-brand-navy text-brand-cream">
        <ParallaxLayer
          speed={0.14}
          className="pointer-events-none absolute -bottom-16 right-[-6%] -z-10 opacity-40"
        >
          <Image
            src="/brand/icon-negative.png"
            alt=""
            width={280}
            height={180}
            className="h-32 w-auto sm:h-44"
          />
        </ParallaxLayer>

        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Qué es Vibra Sagrada</h2>
          <p className="mt-6 text-balance text-brand-cream/80">
            Vibra Sagrada transforma historias personales, recuerdos y
            vínculos emocionales en piezas textiles diseñadas para durar. A
            través de procesos de diseño, impresión y estampado
            completamente autorales, desarrollamos tote bags y playeras que
            buscan alejarse de la lógica del consumo rápido y la producción
            masiva.
          </p>
          <blockquote className="mx-auto mt-10 max-w-xl rounded-2xl border-2 border-brand-cream/30 bg-black/20 px-6 py-5 text-balance font-heading text-lg font-semibold">
            &ldquo;Cuando un diseño nace de una historia real, la prenda deja
            de ser ropa y se convierte en algo que no se quiere
            reemplazar.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* DISEÑOS PERSONALIZADOS — dos bloques separados: el texto sobre
          fondo crema, y el carrusel sobre el patrón "Raya Sagrada" a color
          completo (sin diluir). El carrusel de fotos se administra aparte
          en /admin/disenos-personalizados. */}
      <section className="border-b-2 border-brand-black bg-brand-cream">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-2xl font-extrabold text-black sm:text-3xl">
            Diseños personalizados
          </h2>
          <div className="mx-auto mt-6 max-w-2xl space-y-4 text-balance font-body text-black/70">
            <p>
              Vibra Sagrada transforma historias personales, recuerdos y
              vínculos emocionales en piezas textiles diseñadas para durar. A
              través de procesos de diseño, impresión y estampado
              completamente autorales, desarrollamos tote bags y playeras
              que buscan alejarse de la lógica del consumo rápido y la
              producción masiva.
            </p>
            <p>
              La personalización permite que cada pieza tenga un valor
              emocional, fomentando un consumo más consciente y reduciendo
              la lógica de reemplazo constante.
            </p>
          </div>

          <div className="mt-8">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pop btn-pop-primary px-8 py-3 text-sm"
            >
              Pide tu diseño por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {customDesignImages.length > 0 && (
        <section className="pattern-raya border-b-2 border-brand-black">
          {/* El padding (margen) vive en este contenedor de afuera, y el
              scroll en el de adentro, para que el margen a los lados sea
              siempre del mismo tamaño que el espacio entre fotos, sin
              importar en qué punto del carrusel esté parado el usuario. */}
          <div className="px-4 py-14">
            <CustomDesignsCarousel images={customDesignImages} />
          </div>
        </section>
      )}

      {/* PRODUCTOS DESTACADOS — fondo crema, para diferenciarla del resto
          de secciones (navy arriba, negro del footer abajo). */}
      {featured.length > 0 && (
        <section className="relative overflow-hidden border-y-2 border-brand-black bg-brand-cream">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="text-2xl font-extrabold text-black">Destacados</h2>
              <Link
                href="/tienda?categoria=todos"
                className="font-body text-sm font-semibold text-black underline decoration-2 underline-offset-4 hover:text-white"
              >
                Ver todo
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
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
                  <h3 className="mt-4 font-heading text-sm font-bold text-black">
                    {product.name}
                  </h3>
                  <p className="font-body text-sm text-black/70">
                    {formatPrice(product.priceCents, product.currency)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
