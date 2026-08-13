import type { Metadata } from "next";
import Image from "next/image";
import BpProductPhotosCarousel from "@/components/BpProductPhotosCarousel";
import { WHATSAPP_LINK } from "@/lib/constants";
import { getAllBpUpcomingItems } from "@/lib/bpUpcomingItems";
import { getAllBpProductPhotos } from "@/lib/bpProductPhotos";

// Categorías de producto que se muestran como pills en el hero — fijas en
// el código (no dependen de lo que el admin cargue en "Productos" más
// abajo, esa lista sí es libre y puede tener más, menos, u otros nombres).
const HERO_TAGS = ["Tags", "Bandanas", "Totes", "Collares", "Tazas", "Playeras"];

export const metadata: Metadata = {
  title: "Barks & Paws · Vibra Sagrada",
  description:
    "Accesorios personalizados para mascotas y sus humanos. Tags, bandanas, totes, collares, tazas y playeras. Una marca hija de Vibra Sagrada.",
};

// El contenido de "Lo que viene" y "Productos ya hechos" se administra
// desde /admin/barks-and-paws y puede cambiar en cualquier momento, así que
// esta página no debe quedar cacheada como HTML estático en build (mismo
// criterio que el home de Vibra Sagrada).
export const dynamic = "force-dynamic";

// Landing de presentación de Barks & Paws, la marca hija de Vibra Sagrada
// enfocada en mascotas. Por ahora es solo una landing de presentación (sin
// productos ni carrito propios) — el CTA manda directo a WhatsApp, igual
// que "Diseños personalizados" en el home de Vibra Sagrada. Vive dentro del
// mismo sitio en /barks-and-paws (no un dominio propio todavía), pero con su
// propio layout raíz (src/app/barks-and-paws/layout.tsx, fuera del grupo de
// rutas (site)) para poder tener su propio footer (BpFooter) en vez del
// Footer de Vibra Sagrada.
export default async function BarksAndPawsPage() {
  const [upcomingItems, productPhotos] = await Promise.all([
    getAllBpUpcomingItems(),
    getAllBpProductPhotos(),
  ]);

  return (
    <div>
      {/* HERO — mismo fondo azul/índigo (pattern-bp-grain) que el resto de
          los bloques de marca de Barks & Paws, en vez del crema que tenía
          antes. Sin patitas decorativas ni el crédito "by @VibraSagrada"
          (ese crédito se queda solo en el footer, en su versión sin
          estrella y sin @). */}
      <section className="pattern-bp-grain relative overflow-hidden">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center sm:py-24">
          <Image
            src="/brand/barks-and-paws-logo.png"
            alt="Barks & Paws · Custom Pet Accessories"
            width={523}
            height={468}
            priority
            className="mx-auto h-auto w-56 sm:w-64"
          />
          <p className="mt-2 font-heading text-2xl font-extrabold text-brand-cream sm:text-3xl">
            Tu mascota. Su vibra.
          </p>
          <p className="mx-auto mt-3 max-w-md text-balance font-body text-brand-cream/85">
            Accesorios personalizados para mascotas y sus humanos.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {HERO_TAGS.map((tag, index) => (
              <span key={tag} className="flex items-center gap-2">
                <span className="tag-pop bg-white">{tag}</span>
                {index < HERO_TAGS.length - 1 && (
                  <span className="text-brand-cream/40" aria-hidden="true">
                    ·
                  </span>
                )}
              </span>
            ))}
          </div>

          <div className="mt-8">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pop px-8 py-3 text-sm"
              style={{ background: "var(--brand-bp-teal)", color: "var(--brand-black)" }}
            >
              Pide tu diseño por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* PRODUCTOS — tarjetas administrables desde /admin/barks-and-paws
          (foto + título + descripción cada una). Antes era "Lo que viene"
          (con badge "Pronto", como catálogo de próximo lanzamiento); ahora
          son ejemplos de productos que ya se personalizan. El link a
          WhatsApp vive como botón propio debajo de las tarjetas, no dentro
          del párrafo. No se muestra la sección si todavía no hay ninguna
          tarjeta cargada. */}
      {upcomingItems.length > 0 && (
        <section className="border-y-2 border-brand-black bg-white">
          <div className="mx-auto max-w-4xl px-6 py-16 text-center">
            <h2 className="text-2xl font-extrabold text-black sm:text-3xl">Productos</h2>
            <p className="mx-auto mt-3 max-w-md text-balance font-body text-black/60">
              Personalizamos todo tipo de productos: tazas, estaciones de comida, collares, etc.
            </p>

            {/* Grid de N columnas (una por tarjeta, sin límite fijo de 3) en
                vez de scroll horizontal: todas las tarjetas quedan visibles
                en una sola fila, encogiéndose para caber. */}
            <div
              className="mt-10 grid gap-3 sm:gap-6"
              style={{ gridTemplateColumns: `repeat(${upcomingItems.length}, minmax(0, 1fr))` }}
            >
              {upcomingItems.map((item) => (
                <div key={item.id} className="card-pop relative overflow-hidden text-left">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-20 w-full border-b-2 border-brand-black object-cover sm:h-40"
                    />
                  ) : (
                    <div className="flex h-20 w-full items-center justify-center border-b-2 border-brand-black bg-brand-cream text-[10px] text-black/30 sm:h-40 sm:text-xs">
                      Sin imagen
                    </div>
                  )}
                  <div className="px-2 py-2 text-center sm:px-5 sm:py-4">
                    <h3 className="font-heading text-xs font-bold text-black sm:text-base">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-1 hidden font-body text-xs text-black/55 sm:block">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pop px-8 py-3 text-sm"
                style={{ background: "var(--brand-bp-teal)", color: "var(--brand-black)" }}
              >
                Consúltanos por WhatsApp
              </a>
            </div>
          </div>
        </section>
      )}

      {/* PRODUCTOS YA HECHOS — carrusel administrable desde
          /admin/barks-and-paws. Solo se muestra si hay al menos una foto. */}
      {productPhotos.length > 0 && (
        <section className="border-b-2 border-brand-black bg-brand-cream">
          <div className="mx-auto max-w-4xl px-6 pt-16 text-center">
            <h2 className="text-2xl font-extrabold text-black sm:text-3xl">Productos ya hechos</h2>
            <p className="mx-auto mt-3 max-w-md text-balance font-body text-black/60">
              Algunas piezas que ya se han personalizado, para que veas de qué se trata.
            </p>
          </div>
          <div className="py-10">
            <BpProductPhotosCarousel photos={productPhotos} />
          </div>
        </section>
      )}

      {/* UNA MARCA, UNA FAMILIA — conexión con Vibra Sagrada */}
      <section className="pattern-bp-grain border-b-2 border-brand-black">
        <div className="mx-auto max-w-lg px-6 py-16 text-center text-brand-cream">
          <h2 className="font-heading text-2xl font-extrabold sm:text-3xl">
            Una marca, una familia
          </h2>
          <p className="mt-4 text-balance font-body text-brand-cream/85">
            Barks &amp; Paws nace de Vibra Sagrada, la misma idea de piezas con historia, ahora
            pensada para tu mascota y para ti. Diseños autorales, hechos a pedido, para contar
            juntos la misma historia.
          </p>
          <span
            className="mt-6 inline-flex items-center gap-2 rounded-full border-2 px-4 py-1.5 font-body text-xs font-semibold"
            style={{ borderColor: "var(--brand-bp-teal)", color: "var(--brand-bp-teal)" }}
          >
            ✦ Vibra Sagrada Family ✦
          </span>
        </div>
      </section>
    </div>
  );
}
