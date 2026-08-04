export default function Footer() {
  return (
    <footer className="mt-auto border-t border-black/10">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-black/60">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="tracking-[0.15em] uppercase">Vobra Sagrada</p>
          <div className="flex gap-4">
            {/* TODO: reemplazar con los links reales de redes sociales */}
            <a href="#" className="hover:opacity-70">
              Instagram
            </a>
            <a href="#" className="hover:opacity-70">
              TikTok
            </a>
            <a href="mailto:hola@vobrasagrada.com" className="hover:opacity-70">
              Contacto
            </a>
          </div>
        </div>
        <p className="mt-6 text-xs text-black/40">
          © {new Date().getFullYear()} Vobra Sagrada. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
