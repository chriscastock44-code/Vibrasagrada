import Image from "next/image";
import Link from "next/link";

const INSTAGRAM_URL =
  "https://www.instagram.com/bark.paws?igsh=aXpub2ZwcTBqa2dr&igsi=aXpub2ZwcTBqa2dr&utm_source=qr";

// Footer exclusivo de la landing de Barks & Paws — a propósito NO reutiliza
// el Footer de Vibra Sagrada, porque ese trae el carrusel "Síguenos en
// @vibra_sagrada_mx" (Instagram de Vibra Sagrada, no de Barks & Paws) y esta
// landing necesita su propio Instagram. Fondo negro (igual que el footer de
// Vibra Sagrada) con acentos en teal — el azul/índigo de la marca se queda
// solo en la sección "Una marca, una familia" de la landing, para que el
// footer se distinga de ese bloque. Sí mantiene el link de vuelta a Vibra
// Sagrada para conservar la conexión "marca hija".
export default function BpFooter() {
  return (
    <footer className="mt-auto bg-brand-black text-brand-cream">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex w-fit items-center gap-2">
            <Image
              src="/brand/barks-and-paws-icon.png"
              alt="Barks & Paws"
              width={199}
              height={143}
              className="h-7 w-auto"
            />
          </Link>
          <div className="flex items-center gap-6 font-body text-sm">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-brand-bp-teal"
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
            <Link href="/" className="hover:text-brand-bp-teal">
              Vibra Sagrada
            </Link>
          </div>
        </div>
        <p className="mt-8 font-body text-xs text-brand-cream/70">
          ✦ by @VibraSagrada — accesorios personalizados para mascotas y sus humanos.
        </p>
        <p className="mt-2 font-body text-xs text-brand-cream/50">
          © {new Date().getFullYear()} Barks &amp; Paws. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
