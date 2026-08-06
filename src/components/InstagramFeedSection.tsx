import type { InstagramPost } from "@/lib/types";

const INSTAGRAM_HANDLE = "vibra_sagrada_mx";
const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;

// Carrusel manual: las fotos las sube la marca desde /admin/instagram, no se
// jalan automáticamente de la cuenta real de Instagram (ver esa página para
// más contexto). Si no hay fotos cargadas todavía, la sección simplemente no
// se muestra en vez de dejar un carrusel vacío.
export default function InstagramFeedSection({ posts }: { posts: InstagramPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 flex items-end justify-between">
        <h2 className="text-2xl font-extrabold">Síguenos en @{INSTAGRAM_HANDLE}</h2>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-sm font-semibold underline decoration-2 underline-offset-4 hover:text-brand-navy"
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
            className="card-pop aspect-square w-48 shrink-0 snap-start overflow-hidden sm:w-56"
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
    </section>
  );
}
