import type { Metadata } from "next";
import Image from "next/image";
import ParallaxLayer from "@/components/ParallaxLayer";
import BpProductPhotosCarousel from "@/components/BpProductPhotosCarousel";
import { WHATSAPP_LINK } from "@/lib/constants";
import { getAllBpUpcomingItems } from "@/lib/bpUpcomingItems";
import { getAllBpProductPhotos } from "@/lib/bpProductPhotos";

// El bio de la marca menciona estas tres categorías tal cual, así que van
// fijas en el hero (no dependen de lo que el admin cargue en "Lo que
// viene" — esa lista sí es libre y puede tener más, menos, u otros
// nombres).
const HERO_TAGS = ["Tags", "Bandanas", "Totes"];

export const metadata: Metadata = {
  title: "Barks & Paws — Vibra Sagrada",
  description:
    "Accesorios personalizados para mascotas y sus humanos. Tags, bandanas y totes — una marca hija de Vibra Sagrada.",
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
// mismo sitio en /barks-and-paws (no un dominio propio todavía), así que
// hereda el Header y Footer de Vibra Sagrada del layout de (site).
export default async function BarksAndPawsPage() {
  const [upcomingItems, productPhotos] = await Promise.all([
    getAllBpUpcomingItems(),
    getAllBpProductPhotos(),
  ]);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-brand-cream">
        {/* La rotación va en un span interno, no en el ParallaxLayer: el
            componente pisa cualquier "transform" que le pasemos por style
            (lo necesita para su propio translate3d del scroll), así que una
            rotación puesta ahí directamente se perdería. */}
        <ParallaxLayer
          speed={0.18}
          className="pointer-events-none absolute -left-6 top-8 -z-10 opacity-10"
        >
          <span className="block -rotate-[18deg] text-6xl sm:text-8xl">🐾</span>
        </ParallaxLayer>
        <ParallaxLayer
          speed={0.24}
          className="pointer-events-none absolute -right-4 bottom-6 -z-10 opacity-10"
        >
          <span className="block rotate-[14deg] text-6xl sm:text-8xl">🐾</span>
        </ParallaxLayer>

        <div className="mx-auto max-w-2xl px-6 py-16 text-center sm:py-24">
          <Image
            src="/brand/barks-and-paws-logo.png"
            alt="Barks & Paws — Custom Pet Accessories"
            width={523}
            height={468}
            priority
            className="mx-auto h-auto w-56 sm:w-64"
          />
          <p className="mt-2 font-heading text-2xl font-extrabold text-black sm:text-3xl">
            🐾 Tu mascota. Su vibra.
          </p>
          <p className="mx-auto mt-3 max-w-md text-balance font-body text-black/70">
            Accesorios personalizados para mascotas y sus humanos.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {HERO_TAGS.map((tag, index) => (
              <span key={tag} className="flex items-center gap-2">
                <span className="tag-pop bg-white">{tag}</span>
                {index < HERO_TAGS.length - 1 && (
                  <span className="text-black/30" aria-hidden="true">
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

          <p className="mt-6 font-body text-xs font-semibold text-black/50">
            ✦ by @VibraSagrada
          </p>
        </div>
      </section>

      {/* LO QUE VIENE — tarjetas administrables desde /admin/barks-and-paws
          (foto + título + descripción cada una). No se muestra la sección
          si todavía no hay ninguna cargada. */}
      {upcomingItems.length > 0 && (
        <section className="border-y-2 border-brand-black bg-white">
          <div className="mx-auto max-w-4xl px-6 py-16 text-center">
            <h2 className="text-2xl font-extrabold text-black sm:text-3xl">Lo que viene</h2>
            <p className="mx-auto mt-3 max-w-md text-balance font-body text-black/60">
              Estamos preparando la primera colección — muy pronto puedes personalizar la tuya.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {upcomingItems.map((item) => (
                <div key={item.id} className="card-pop relative overflow-hidden text-left">
                  <span className="absolute top-3 right-3 z-10 rounded-full bg-brand-black px-2.5 py-1 font-body text-[10px] font-bold tracking-wide text-white uppercase">
                    Pronto
                  </span>
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-40 w-full border-b-2 border-brand-black object-cover"
                    />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center border-b-2 border-brand-black bg-brand-cream text-xs text-black/30">
                      Sin imagen
                    </div>
                  )}
                  <div className="px-5 py-4 text-center">
                    <h3 className="font-heading text-base font-bold text-black">{item.title}</h3>
                    {item.description && (
                      <p className="mt-1 font-body text-xs text-black/55">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
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
              Algunas piezas que ya se han personalizado — para que veas de qué se trata.
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
            Barks &amp; Paws nace de Vibra Sagrada — la misma idea de piezas con historia, ahora
            pensada para tu mascota y para ti. Diseños autorales, hechos a pedido, para contar
            juntos la misma historia.
          </p>
          <span
            className="mt-6 inline-flex items-center gap-2 rounded-full border-2 px-4 py-1.5 font-body text-xs font-semibold"
            style={{ borderColor: "var(--brand-bp-teal)", color: "var(--brand-bp-teal)" }}
          >
            ✦ Vibra Sagrada Family
          </span>
        </div>
      </section>
    </div>
  );
}
