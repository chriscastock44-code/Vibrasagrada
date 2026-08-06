import Image from "next/image";
import { getAllInstagramPosts } from "@/lib/instagramPosts";

const INSTAGRAM_HANDLE = "vibra_sagrada_mx";
const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;

// El carrusel de Instagram vive dentro del footer (mismo fondo negro, en
// todas las páginas) en vez de ser una sección aparte solo en el home. Las
// fotos se administran desde /admin/instagram; si no hay ninguna cargada
// todavía, esta parte simplemente no se muestra.
export default async function Footer() {
  const posts = await getAllInstagramPosts();

  return (
    <footer className="mt-auto bg-brand-black text-brand-cream">
      <div
        className="h-1.5 w-full"
        style={{
          background:
            "linear-gradient(90deg, var(--brand-blue), var(--brand-pink), var(--brand-navy), var(--brand-yellow))",
        }}
      />

      {posts.length > 0 && (
        <div className="border-b-2 border-brand-cream/10">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="font-heading text-xl font-extrabold sm:text-2xl">
                Síguenos en @{INSTAGRAM_HANDLE}
              </h2>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm font-semibold underline decoration-2 underline-offset-4 hover:text-brand-yellow"
              >
                Ver en Instagram
              </a>
            </div>

            <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2">
              {posts.map((post) => (
                <a
                  key={post.id}
                  href={post.link || INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-pop aspect-square w-40 shrink-0 snap-start overflow-hidden sm:w-48"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="h-full w-full rounded-[calc(1rem-2px)] object-cover transition hover:scale-105"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/brand/icon-negative.png"
              alt="Vibra Sagrada"
              width={40}
              height={26}
              className="h-7 w-auto"
            />
            <span className="font-heading text-base font-extrabold tracking-tight">
              vibra sagrada
            </span>
          </div>
          <div className="flex items-center gap-6 font-body text-sm">
            <a
              href="https://instagram.com/vibra_sagrada_mx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-brand-yellow"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4.2" />
                <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
              </svg>
              Instagram
            </a>
            {/* TODO: confirmar dominio real de contacto una vez definido */}
            <a href="mailto:hola@vibrasagrada.com" className="hover:text-brand-yellow">
              Contacto
            </a>
          </div>
        </div>
        <p className="mt-8 font-body text-xs text-brand-cream/50">
          Tote bags · playeras · piezas con historia
        </p>
        <p className="mt-2 font-body text-xs text-brand-cream/40">
          © {new Date().getFullYear()} Vibra Sagrada. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
