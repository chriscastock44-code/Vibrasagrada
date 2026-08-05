import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-auto bg-brand-black text-brand-cream">
      <div
        className="h-1.5 w-full"
        style={{
          background:
            "linear-gradient(90deg, var(--brand-blue), var(--brand-pink), var(--brand-navy), var(--brand-yellow))",
        }}
      />
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
          <div className="flex gap-6 font-body text-sm">
            <a
              href="https://instagram.com/vibra_sagrada_mx"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-yellow"
            >
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
